
const FileExiv = require('./file-exiv.js');
const { tsFromExiv, tzFromGPS } = require('./timestamp.js');

module.exports = class FileMovie extends FileExiv {
	get constExivTS() { return 'CreateDate'; }

	async exivReadAll(file) {
		return super.exivReadAll(file)
			.then(exivData => {
				if (exivData.GPSPosition) {
					exivData.calculatedTimezone = tzFromGPS(exivData.GPSPosition);
				}
				return exivData;
			});
	}

	async exivReload() {
		return super.exivReload().then(exivData => {
			this.exiv_calculated_timezone = exivData.calculatedTimezone;
			this.exiv_timestamp           = tsFromExiv(exivData[this.constExivTS], this.exiv_calculated_timezone);
			return exivData;
		});
	}

	async check() {
		return super.check();

		// // TODO: here, we should write it in "check"
		// if (!exivData[this.constExivTS] && exivData.DateTimeOriginal) {
		// 	exivData[this.constExivTS] = exivData.DateTimeOriginal;
		// }
	}

	// async exivWriteTimestamp(ts) {
	// 	return super.exivWriteTimestamp(ts);
	// }
};
