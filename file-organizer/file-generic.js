
const path = require('path');
const process = require('process');

const chalk = require('chalk');

const messages = require('./messages.js');
const fileUtils = require('./file-utils.js');
const options = require('./options.js');

const pLimit = require('p-limit'); // https://www.npmjs.com/package/p-limit
const renameLimiter = pLimit(1);

const activeFilesList = new Map();

let id = 0;

class FileGeneric {

	constructor(filePath) {
		this._id = id++;
		this._relativePath = filePath;
		this._parent = null;
		this._infos = {};
		this._originalFilePath = filePath;

		this.generic_original_extension = this.getExtension();

		this.stats = {
			fixed: 0,
			skipped: 0,
			errors: 0
		};

		activeFilesList.set(this.id, this);
		messages.statsAddFileToTotal();
		messages.statsSetPendingFiles(activeFilesList.size);
		this.messages = new Map();
	}

	end() {
		if (activeFilesList.has(this.id)) {
			activeFilesList.delete(this.id);
		}
		if (options.withFileSummary) {
			if (this.messages.size > 0) {
				messages.writeLine(
					'*** '
				+ this.parent.getRelativePath() + '/' + chalk.bold(this.getFilename()) + this.getExtension()
				+ (this._originalFilePath != this.getRelativePath() ? '\n  < ' + this._originalFilePath : '')
				+ Array.from(this.messages.entries())
					.map(v => v[1])
					.map(v => '\n  ' + v)
					.reduce((prev, cur) => prev += cur, '')
				+ '\n'
				);
			}
			this.messages = new Map();
		}
		messages.statsSetPendingFiles(activeFilesList.size);
	}

	/**
	 * @param description(string): free text
	 *
	 * @param newInfo(null/string): the new information (display only)
	 *
	 * @param icon(null/true/function):
	 *    null: action errors (impossible)
	 *    true: info message of success
	 *    fn: fix function
	 */
	addMessage(code, description, newInfo = null, icon = null) {
		this.messages.set(code, icon
			+ (description ? ' ' + chalk.yellow((description).padEnd(40, ' ')) : '')
			+ (newInfo     ? ' ' + chalk.blue('' + newInfo) : '')
		);
	}

	addMessageImpossible(code, description) {
		this.stats.errors++;
		messages.statsAddErrorToTotal();
		this.addMessage(code, description, null, messages.IconFailure);
		return false;
	}

	addMessageInfo(code, description, newInfo = null) {
		this.addMessage(code, description, newInfo, messages.IconSuccess);
		return true;
	}

	async addMessageCommit(code, description, newInfo = null, action = null) {
		let res = false;
		let msg = messages.IconSkipped;

		if (options.dryRun) {
			this.stats.fixSkipped++;
			messages.statsAddSkippedFix();
		} else {
			try {
				res = await action();

				if (res === undefined) {
					res = true;
				}
				if (res) {
					msg = messages.IconSuccess;
					this.stats.fixed++;
					messages.statsAddFixToTotal();
				} else {
					msg = messages.IconFailure;
					this.stats.errors++;
					messages.statsAddErrorToTotal();
				}
			} catch (e) {
				messages.notifyError(e);
				this.stats.errors++;
				messages.statsAddErrorToTotal();
				res = false;
			}
		}
		this.addMessage(code, description, newInfo, msg);
		return res;
	}

	// TODO: to be tested
	async addMessageConvert(code, targetExtension, action) {
		const sourcePath    = this.getRelativePath();
		const targetPath    = path.join(fileUtils.getDirname(this.getRelativePath()), this.getFilename() + targetExtension);
		const convertedPath = path.join(fileUtils.getDirname(this.getRelativePath()), this.getFilename() + FileGeneric.convertedSuffix + this.getExtension());

		let res = await messages.addMessageCommit(code + '_CONVERT', 'Convert file', targetExtension, async () => action(sourcePath, targetPath));
		if (res) {
			res = res && await messages.addMessageCommit(code + '_OBSOLETE', 'Move away original file', fileUtils.getFilename(convertedPath),
				() => fileUtils.fileRename(this.getRelativePath(), convertedPath)
			);
		}
		return res;
	}

	getType() {
		return 'generic';
	}

	get parent() {
		if (this._parent == null) {
			const FileFolder = require('./file-folder.js');
			let parentDir = path.dirname(this._relativePath);
			if (parentDir == '.') {
				// switch to absolute path
				parentDir = path.dirname(this._getAbsolutePath());
			}
			if (parentDir == '/') {
				return null;
			}
			this._parent = new FileFolder(parentDir);
		}
		return this._parent;
	}

	_getAbsolutePath() {
		if (this._relativePath[0] == '/') {
			return this._relativePath;
		}
		return path.join(process.cwd(), this._relativePath);
	}

	getRelativePath() {
		return this._relativePath;
	}

	/**
	 * Without extension
	 */
	getFilename() {
		return fileUtils.getFilename(this.getRelativePath());
	}

	/**
	 * Format: .blabla
	 */
	getExtension() {
		return fileUtils.getExtension(this.getRelativePath());
	}

	async loadData() {
		return this;
	}

	async changeFilename(newFilename) {
		return this.rename(newFilename + this.getExtension());
	}

	// TODO (indexed): //ise it
	// @Limited(1)
	async rename(newFilenameWithExtension) {
		const newPath = path.join(this.parent.getRelativePath(), newFilenameWithExtension);
		if (this.getRelativePath() == newPath) {
			return true;
		}

		// Only one at at time...
		return renameLimiter(async () => {
			await fileUtils.fileRename(
				this.getRelativePath(),
				newPath
			);
			this._relativePath = newPath;
			return true;
		});
	}

	async remove() {
		return fileUtils.fileDelete(this.getRelativePath());
	}

	async iterate(apply) {
		return Promise.resolve(this)
			.then(() => apply(this))
			.finally(() => this.end());
	}

	async check() {
		let res = true;
		{
			// Lowercase extension
			if (this.getExtension().toLowerCase() != this.getExtension()) {
				let proposedFN = this.getFilename() + this.getExtension().toLowerCase();
				res = res && await this.addMessageCommit('FILE_EXT_UPPERCASE', 'uppercase extension',
					proposedFN,
					() => this.rename(proposedFN)
				);
			}
		}

		{
			if (this.getExtension() == '.jpeg') {
				res = res && await this.addMessageCommit('FILE_EXT_NORMALIZE', 'align extension to 3 char',
					'jpg',
					() => this.rename(this.getFilename() + '.jpg')
				);
			}
		}

		return res;
	}
}

module.exports = FileGeneric;
FileGeneric.convertedSuffix = '_converted';
