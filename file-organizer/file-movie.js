
const FileExiv = require('./file-exiv.js');
const { tsFromDateAndTimezone } = require('./timestamp.js');

module.exports = class FileMovie extends FileExiv {
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
		return super.exivWriteTimestamp(ts, this.calculatedTimezone);
	}
};
