
const FileExiv = require('./file-exiv.js');

module.exports = class FileMovie extends FileExiv {
	get constExivTS() { return 'CreateDate'; }

	async exivReadAll(file) {
		return super.exivReadAll(file)
			.then(exivData => {
				if (!exivData[this.constExivTS] && exivData.DateTimeOriginal) {
					// TODO: here, we should write it in "check"
					exivData[this.constExivTS] = exivData.DateTimeOriginal;
				}
				return exivData;
			});
	}

	async loadData() {
		return super.loadData();
		// .finally(() => {
		// 	if (this.exiv_calculated_timezone) {
		// 		this.exiv_timestamp.tz(this.exiv_calculated_timezone);
		// 	}
		// });
	}

	// async exivWriteTimestamp(ts) {
	// 	return super.exivWriteTimestamp(ts);
	// }
};
