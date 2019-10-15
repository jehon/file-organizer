
const FileMovie = require('./file-movie.js');
// const { tsFromDateAndTimezone } = require('./timestamp.js');

module.exports = class FileMovieUCT extends FileMovie {
	// TODO (mp4-ts): hook data functions

	async exivWriteTimestamp(_ts) {
		throw new Error('Movie write timestamp not implemented');
	}
};
