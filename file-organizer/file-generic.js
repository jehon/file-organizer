/**
 * Conventions
 *   - path include filename and extension
 *   - filename = without extension
 *   - extension = .blabla
 */

const path = require('path');
const process = require('process');

const ansiEscapes = require('ansi-escapes');

const options = require('./options.js');
const messages = require('./messages.js');
const FileUtils = require('./file-utils.js');
const BusinessError = require('./business-error.js');

class FileGeneric {
	constructor(filePath) {
		this._relativePath = filePath;
		this._parent = null;
		this._infos = {};

		this.addInfo('file.name',          this.getFilename());
		this.addInfo('file.extension',     this.getExtension());
		this.addInfo('file.path.relative', this.getRelativePath());
		this.addInfo('file.path.absolute', this._getAbsolutePath());
		if (this.parent != null) {
			this.addInfo('file.parent.name',   this.parent.getFilename());
		}

		this.errors = [];
	}

	addInfo(key, val) {
		if (!val) {
			return;
		}
		if (typeof(val) != 'string') {
			val = '' + val;
		}
		this._infos[key] = val;
	}

	getInfo(key) {
		if (key in this._infos) {
			return this._infos[key];
		}
		return '';
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
		return path.parse(this.getRelativePath()).name;
	}

	/**
	 * Format: .blabla
	 */
	getExtension() {
		return path.parse(this.getRelativePath()).ext;
	}

	// async getIndexedFilenameFor(newFilenameWithoutIndex) {
	// 	return await FileUtils.findIndexedFilename(
	// 		this.parent.getRelativePath(),
	// 		newFilenameWithoutIndex,
	// 		this.getFilename(),
	// 		this.getExtension());
	// }

	async changeFilename(newFilename) {
		return await this.rename(newFilename + this.getExtension());
	}

	async rename(newFilenameWithExtension) {
		const newPath = path.join(this.parent.getRelativePath(), newFilenameWithExtension);
		if (this.getRelativePath() == newPath) {
			return true;
		}
		try {
			await FileUtils.fileRename(
				this.getRelativePath(),
				newPath
			);
		} catch(e) {
			throw new BusinessError('Error while renaming file: ', this.getRelativePath(), e);
		}
		this._relativePath = newPath;
		return true;
	}

	async remove() {
		return await FileUtils.fileDelete(this.getRelativePath());
	}

	async iterate(apply) {
		const res = [];
		res.push(await apply(this));
		return res;
	}

	/**
	 * !! Await on this one: await this.checkMsg(...)
	 *
	 * @param description(string): free text
	 *
	 * @param newInfo(null/string): the new information (display only)
	 *
	 * @param action(null/true/function):
	 *    null: action impossible
	 *    true: info message of success
	 *    fn: fix function
	 */
	async checkMsg(code, description, newInfo = null, action = null) {
		return messages.checkMsg(this, code, description, newInfo, action);
	}

	async check() {
		messages.stats.filesCount++;

		if (options.interactive) {
			// Write infos on one line, erase it after
			process.stdout.write(`\rCurrent files: ${messages.stats.filesCount} - fixes: ${messages.stats.fixesCount} - skipped: ${messages.stats.skippedCount} - errors: ${messages.stats.errorsCount} - impossible: ${messages.stats.impossibleCount}` + ansiEscapes.eraseEndLine + '\r');
		}

		let res = true;
		{
			// Lowercase extension
			if (this.getExtension().toLowerCase() != this.getExtension()) {
				let proposedFN = this.getFilename() + this.getExtension().toLowerCase();
				res = res && await this.checkMsg('FILE_EXT_UPPERCASE', 'uppercase extension',
					proposedFN,
					() => this.rename(proposedFN)
				);
			}
		}

		{
			if (this.getExtension() == '.jpeg') {
				res = res && await this.checkMsg('FILE_EXT_NORMALIZE', 'align extension to 3 char',
					'jpg',
					() => this.rename(this.getFilename() + '.jpg')
				);
			}
		}

		return res;
	}
}

module.exports = FileGeneric;
