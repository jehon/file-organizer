

const fs = require('fs');

const FileGeneric = require('./file-generic.js');
const { tsFromString, tsFromDate } = require('./timestamp.js');

class FileTimestamped extends FileGeneric {
	constructor(filePath) {
		super(filePath);

		this.filenameTS = tsFromString(this.getFilename());

		// Parse the original filename to see if we can get some data
		if (this.filenameTS.original) {
			const ts2 = tsFromString(this.filenameTS.original);
			if (ts2.year > 0) {
				this.filenameTS = ts2;
			}
		}
		this.calculatedTS = this.filenameTS.clone();

		this.addInfo('timestamp.filename', this.filenameTS);
	}

	getTSFromFileModificationDate() {
		return tsFromDate(fs.statSync(this.getRelativePath()).birthtime);
	}

	setCalculatedTSToIfMatching(newTS, category = 'internal') {
		if (!newTS.matchLithe(this.parent.calculatedTS)) {
			return this.checkMsg('ERR', `${category} timestamp incoherent to calculated timestamp`,
				`${newTS.TS()} / ${this.parent.calculatedTS.TS()}`,
				null);
		}

		for(const k of [ 'year', 'month', 'day', 'hour', 'minute', 'second']) {
			this.calculatedTS[k] = newTS[k];
		}

		return true;
	}

	getCanonicalFilename() {
		let proposedFilename = this.calculatedTS.TS();
		if (this.calculatedTS.comment > '') {
			proposedFilename += ' ' + this.calculatedTS.comment;
		}
		if (this.calculatedTS.original > '') {
			proposedFilename +=  ' [' + this.calculatedTS.original + ']';
		}
		return proposedFilename.trim();
	}

	async check() {
		if (!await super.check()) {
			return false;
		}

		let res = true;
		if (this.calculatedTS.year > 0) {
			{
				// Check filename according to parent folder TS
				if (this.parent.calculatedTS.year > 0) {
					if (!this.calculatedTS.matchLithe(this.parent.calculatedTS)) {
						return this.checkMsg('TS_PARENT_INCOHERENT', 'calculated timestamp incoherent to parent folder',
							`${this.calculatedTS.TS()} / ${this.parent.calculatedTS.TS()}`,
							null);
					}
				}
			}

			{
				// Rename to the canonical filename
				const proposedFilename = this.getCanonicalFilename();
				if (proposedFilename != this.getFilename()) {
					res &= await this.checkMsg('TS_CANONIZE', 'canonize filename',
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
