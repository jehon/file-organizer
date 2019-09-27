

const fs = require('fs');
const path = require('path');

const { fileExists } = require('./file-utils');

const messages = require('./messages.js');
const FileGeneric = require('./file-generic.js');
const { tsFromString, tsFromDate } = require('./timestamp.js');
const options = require('./options.js');

class FileTimestamped extends FileGeneric {
	constructor(filePath) {
		super(filePath);

		this.filenameTS = tsFromString(this.getFilename());
		const comment = this.filenameTS.comment;

		// Parse the original filename to see if we can get some data
		if (this.filenameTS.original) {
			const ts2 = tsFromString(this.filenameTS.original);
			if (ts2.year > 0) {
				this.filenameTS = ts2;
			}
		}
		this.filenameTS.comment = comment;
		this.calculatedTS = this.filenameTS.clone();

		this.addInfo('timestamp.filename', this.filenameTS.TS());
		this.addInfo('timestamp.comment',  this.filenameTS.comment);
		this.addInfo('timestamp.original', this.filenameTS.original);
	}

	getTSFromFileModificationDate() {
		return tsFromDate(fs.statSync(this.getRelativePath()).birthtime);
	}

	setCalculatedComment(newC) {
		this.calculatedTS.comment = newC;
		return true;
	}


	setCalculatedTS(newTS) {
		if (typeof newTS == 'string') {
			newTS = tsFromString(newTS);
		}

		for(const k of [ 'year', 'month', 'day', 'hour', 'minute', 'second']) {
			this.calculatedTS[k] = newTS[k];
		}

		return true;
	}

	getCanonicalFilename() {
		let proposedFilename = '';
		if (this.calculatedTS.TS() > '') {
			proposedFilename += this.calculatedTS.TS();
		}
		if (this.calculatedTS.comment > '') {
			proposedFilename += ' ' + this.calculatedTS.comment;
		}
		if (this.calculatedTS.original + '' > '') {
			proposedFilename +=  ' [' + this.calculatedTS.original + ']';
		}
		return proposedFilename.trim();
	}

	async getIndexedFilename() {
		const o = this.calculatedTS.original;
		// if (/^\d+$/.match(o)) {
		// 	this.calculatedTS.original = '';
		// }
		if (this.getCanonicalFilename() == this.getFilename()) {
			return this.getFilename();
		}

		const p = (proposedFilename) => path.join(this.parent.getRelativePath(), proposedFilename + this.getExtension());
		if (! await fileExists(p(this.getCanonicalFilename()))) {
			return this.getCanonicalFilename();
		}

		this.calculatedTS.original = 1;
		while(this.calculatedTS.original != o && await fileExists(p(this.getCanonicalFilename()))) {
			this.calculatedTS.original++;
		}

		return this.getCanonicalFilename();
	}

	async check() {
		if (this.calculatedTS.type == 'invalid') {
			return messages.fileImpossible(this, 'TS_FILENAME_INVALID', 'filename is not parsable');
		}

		let res = true;
		if (this.calculatedTS.comment && this.calculatedTS.comment == this.calculatedTS.original) {
			messages.fileCommit(this, 'TS_DUP_COMMENT', 'remove duplicate comment/original',
				'remove original filename',
				() => { this.calculatedTS.original = ''; }
			);
		}

		{
			if (options.setComment) {
				messages.fileInfo(this, 'TS_COMMENT_OPTION_FILENAME', 'force the comment as requested on command line',
					options.setComment
				);
				this.setCalculatedComment(options.setComment);
			}
			if (options.forceCommentFromFolder) {
				messages.fileInfo(this, 'TS_COMMENT_OPTION_FOLDER', 'force the comment from the parent folder',
					this.parent.filenameTS.comment
				);
				this.setCalculatedComment(this.parent.filenameTS.comment);
			}

			if (!this.calculatedTS.comment && this.filenameTS.comment) {
				messages.fileInfo(this, 'TS_COMMENT_FILENAME', 'set the comment from the filename',
					this.filenameTS.comment
				);
				this.setCalculatedComment(this.filenameTS.comment);
			}
			if (!this.calculatedTS.comment && this.parent.filenameTS.comment) {
				messages.fileInfo(this, 'TS_COMMENT_FOLDER', 'set the comment from the parent folder',
					this.filenameTS.comment
				);
				this.setCalculatedComment(this.parent.filenameTS.comment);
			}
		}

		{
			if (options.forceTimestampFromFilename) {
				messages.fileInfo(this, 'TS_TIMESTAMP_FORCE', 'Updating timestamp',
					this.filenameTS.TS());
				this.setCalculatedTS(this.filenameTS);
			}
		}

		if (!this.calculatedTS.comment) {
			res = res && messages.fileImpossible(this, 'TS_NO_COMMENT', 'No comment found');
		}

		if (this.calculatedTS.TS() == '') {
			res = res && messages.fileImpossible(this, 'TS_NO_TIMESTAMP', 'No timestamp found');
		} else {
			// Check filename according to parent folder TS
			if (this.parent.calculatedTS.year > 0) {
				if (!this.calculatedTS.matchLithe(this.parent.calculatedTS)) {
					res = res && messages.fileImpossible(this, 'TS_PARENT_INCOHERENT',
						`calculated timestamp incoherent to parent folder (${this.calculatedTS.TS()} / ${this.parent.calculatedTS.TS()})`
					);
				}
			}
		}

		if (!res) {
			return res;
		}

		if (!await super.check()) {
			return false;
		}

		{
			// Rename to the canonical filename
			const proposedFilename = await this.getIndexedFilename();
			if (proposedFilename != this.getFilename()) {
				if (await fileExists(path.join(this.parent.getRelativePath(), proposedFilename + this.getExtension()))) {
					res = res && messages.fileImpossible(this, 'TS_DUP_FILES', 'file already exists',
						proposedFilename
					);

				} else {
					res = res && await messages.fileCommit(this, 'TS_CANONIZE', 'canonize filename',
						proposedFilename,
						() => this.changeFilename(proposedFilename)
					);
				}
			}
		}

		return res;
	}
}

module.exports = FileTimestamped;
