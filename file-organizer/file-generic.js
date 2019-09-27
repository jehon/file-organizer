/**
 * Conventions
 *   - path include filename and extension
 *   - filename = without extension
 *   - extension = .blabla
 */

const path = require('path');
const process = require('process');

const messages = require('./messages.js');
const FileUtils = require('./file-utils.js');

const pLimit = require('p-limit'); // https://www.npmjs.com/package/p-limit
const renameOneByOneLimiter = pLimit(1);

class FileGeneric {
	constructor(filePath) {
		this._relativePath = filePath;
		this._parent = null;
		this._infos = {};
		this._originalFilePath = filePath;

		this.addInfo('file.name',          this.getFilename());
		this.addInfo('file.extension',     this.getExtension());
		this.addInfo('file.path.relative', this.getRelativePath());
		this.addInfo('file.path.absolute', this._getAbsolutePath());
		if (this.parent != null) {
			this.addInfo('file.parent.name',   this.parent.getFilename());
		}

		this.stats = {
			fixed: 0,
			skipped: 0,
			errors: 0
		};

		this.errors = [];
	}

	getType() {
		return 'generic';
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
		return FileGeneric.getFilename(this.getRelativePath());
	}

	/**
	 * Format: .blabla
	 */
	getExtension() {
		return FileGeneric.getExtension(this.getRelativePath());
	}

	async loadData() {
		return this;
	}

	async changeFilename(newFilename) {
		return await this.rename(newFilename + this.getExtension());
	}

	// TODO (indexed): //ise it
	async rename(newFilenameWithExtension) {
		const newPath = path.join(this.parent.getRelativePath(), newFilenameWithExtension);
		if (this.getRelativePath() == newPath) {
			return true;
		}

		// Only one at at time...
		return await renameOneByOneLimiter(async () => {
			await FileUtils.fileRename(
				this.getRelativePath(),
				newPath
			);
			this._relativePath = newPath;
			return true;
		});
	}

	async remove() {
		return await FileUtils.fileDelete(this.getRelativePath());
	}

	async iterate(apply) {
		return Promise.resolve(this)
			.then(() => messages.fileStart(this))
			.then(() => apply(this))
			.then((res) => { messages.fileEnd(this); return res; });
	}

	async check() {
		let res = true;
		{
			// Lowercase extension
			if (this.getExtension().toLowerCase() != this.getExtension()) {
				let proposedFN = this.getFilename() + this.getExtension().toLowerCase();
				res = res && await messages.fileCommit(this, 'FILE_EXT_UPPERCASE', 'uppercase extension',
					proposedFN,
					() => this.rename(proposedFN)
				);
			}
		}

		{
			if (this.getExtension() == '.jpeg') {
				res = res && await messages.fileCommit(this, 'FILE_EXT_NORMALIZE', 'align extension to 3 char',
					'jpg',
					() => this.rename(this.getFilename() + '.jpg')
				);
			}
		}

		return res;
	}
}

FileGeneric.getFullFilename = function(relativePath) {
	return path.parse(relativePath).base;
};

FileGeneric.getFilename = function(relativePath) {
	return path.parse(relativePath).name;
};

FileGeneric.getExtension = function(relativePath) {
	return path.parse(relativePath).ext;
};

module.exports = FileGeneric;

