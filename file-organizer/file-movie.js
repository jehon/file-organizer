
const FileExiv = require('./file-exiv.js');
const { tsFromDateAndTimezone } = require('./timestamp.js');

module.exports = class FileMovie extends FileExiv {
	get type() { return 'movie'; }
	get constExivTS() { return 'CreateDate'; }

	async exivReadAll(file) {
		return super.exivReadAll(file)
			.then(exivData => {
				if (!exivData[this.constExivTS] && exivData.DateTimeOriginal) {
					// TODO: here, we should write it in "check"
					exivData[this.constExivTS] = exivData.DateTimeOriginal;
				}
				if (exivData.calculatedTimezone) {
					exivData[this.constExivTS] = tsFromDateAndTimezone(exivData[this.constExivTS].replace(':', '-').replace(':', '-'), exivData.calculatedTimezone).TS();
				}
				return exivData;
			});
	}

	async exivWriteTimestamp(ts) {
		if (this.calculatedTimezone) {
			throw new Error('Movie write timestamp not implemented');
		}
		return super.exivWriteTimestamp(ts);
	}
};
