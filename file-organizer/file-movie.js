
const FileExiv = require('./file-exiv.js');
const { tzFromGPS, tsFromDateAndTimezone } = require('./timestamp.js');
const BusinessException = require('./business-error.js');

module.exports = class FileMovie extends FileExiv {
	getType() {
		return 'movie';
	}
	// TODO: hook data functions

	exivReadAll(file) {
		const resultObj = super.exivReadAll(file);
		// console.log(resultObj);
		if (!resultObj.DateTimeOriginal && resultObj.CreateDate) {
			// CreateDate
			// GPSPosition
			if (resultObj.GPSPosition) {
				const tz = tzFromGPS(resultObj.GPSPosition);
				resultObj.DateTimeOriginal = tsFromDateAndTimezone(resultObj.CreateDate.replace(':', '-').replace(':', '-'), tz).TS();
			} else {
				resultObj.DateTimeOriginal = resultObj.CreateDate;
			}
		}
		return resultObj;
	}

	exivWriteTimestamp(_ts) {
		throw new BusinessException('Movie write timestamp not implemented');
	}
};
