
const FileMovie = require('./file-movie.js');
const { tzFromGPS, tsFromDateAndTimezone } = require('./timestamp.js');

module.exports = class FileMovieUCT extends FileMovie {
	getType() {
		return 'movieUTC';
	}
	// TODO (mp4-ts): hook data functions

	// TODO(async): rewrite
	async exivReadAll(file) {
		const resultObj = await super.exivReadAll(file);
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
		throw new Error('Movie write timestamp not implemented');
	}
};
