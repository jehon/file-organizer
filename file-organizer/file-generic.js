/**
 * Conventions
 *   - path include filename and extension
 *   - filename = without extension
 *   - extension = .blabla
 */

const path = require('path');
const process = require('process');

const ansiEscapes = require('ansi-escapes');
const getCursorPosition = require('get-cursor-position');
require('colors');

const options = require('./options.js');
const { ellipseLeft } = require('./string-utils.js');
const FileUtils = require('./file-utils.js');
const BusinessError = require('./business-error.js');

let filesCount = 0;
let fixesCount = 0;
let errorsCount = 0;
let skippedCount = 0;
let impossibleCount = 0;

let lastLogFile = false;

class FileGeneric {
	constructor(filePath) {
		this._relativePath = filePath;
		this._parent = null;
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
	async checkMsg(description, newInfo = null, action = null) {
		let msg = '';

		// Force being at the beginnning of the line
		const cursorPos = getCursorPosition.sync();
		if (cursorPos.col >  0) {
			process.stdout.write(ansiEscapes.eraseLine);
			process.stdout.write(ansiEscapes.cursorTo(0));
		}

		if (lastLogFile != this) {
			msg += '\n';
			msg += (this.getFilename() + this.getExtension());
			msg += ' ';
			msg += ellipseLeft(this.parent.getRelativePath() + '/ ', 60).gray;
			msg += '\n';

			lastLogFile = this;
		}

		msg += '  ';

		let res = false;
		// This will be changed by the 'action'

		if (action === null) {
			msg += '⚑'.red;
			impossibleCount++;
		} else if (action === true) {
			msg += '✓'.green;
		} else {
			if (!options.dryrun) {
				try {
					res = await action();
				} catch (e) {
					if (e instanceof BusinessError) {
						console.error('Error: ', e.getMessage ? e.getMessage() : '');
					} else {
						console.error('Error: ', e);
						errorsCount++;
					}
				}
				if (res == undefined || res) {
					msg += '✓'.green;
					fixesCount++;
				} else {
					msg += '✘'.red.bold;
					errorsCount++;
				}
			} else {
				msg +=  '⚐'.orange;
				skippedCount++;
			}
		}

		msg += ' ';
		msg += (description).padEnd(30, ' ').yellow.bold;

		msg += ' ';
		msg += (newInfo != null ? ('' + newInfo).blue : '');

		process.stdout.write(msg + '\n');
		FileGeneric.checkMessages += msg;
		return res;
	}

	async check() {
		filesCount++;

		// Write infos on one line, erase it after
		process.stdout.write(`\rCurrent files: ${filesCount} - fixes: ${fixesCount} - skipped: ${skippedCount} - errors: ${errorsCount} - impossible: ${impossibleCount}` + ansiEscapes.eraseEndLine + '\r');

		let res = true;
		{
			// Lowercase extension
			if (this.getExtension().toLowerCase() != this.getExtension()) {
				let proposedFN = this.getFilename() + this.getExtension().toLowerCase();
				res = res && await this.checkMsg('uppercase extension',
					proposedFN,
					() => this.rename(proposedFN)
				);
			}
		}
		return res;
	}
}


module.exports = FileGeneric;
