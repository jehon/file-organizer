
const FileMovie = require('./file-movie.js');
const { tzFromGPS, tsFromDateAndTimezone } = require('./timestamp.js');

module.exports = class FileMovieUCT extends FileMovie {
	getType() {
		return 'movieUTC';
	}
	// TODO (mp4-ts): hook data functions

	async exivReadAll(file) {
		return super.exivReadAll(file)
			.then(resultObj => {
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
			});
	}

	async exivWriteTimestamp(_ts) {
		throw new Error('Movie write timestamp not implemented');
	}
};
