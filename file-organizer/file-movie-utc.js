
const FileMovie = require('./file-movie.js');
const { tsFromDateAndTimezone } = require('./timestamp.js');

module.exports = class FileMovieUCT extends FileMovie {
	get type() { return 'movieUTC';	}
	get constExivTS() { return 'CreateDate'; }
	// TODO (mp4-ts): hook data functions

	async exivReadAll(file) {
		return super.exivReadAll(file)
			.then(exivData => {
				if (!exivData[this.constExivTS] && exivData.DateTimeOriginal) {
					exivData[this.constExivTS] = exivData.DateTimeOriginal;
				}
				if (exivData.calculatedTimezone) {
					exivData[this.constExivTS] = tsFromDateAndTimezone(exivData[this.constExivTS].replace(':', '-').replace(':', '-'), exivData.calculatedTimezone).TS();
				}
				return exivData;
			});
	}

	async exivWriteTimestamp(_ts) {
		throw new Error('Movie write timestamp not implemented');
	}
};
