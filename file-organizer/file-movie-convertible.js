
const FileMovie = require('./file-movie.js');

module.exports = class FileMovieConvertible extends FileMovie {
	getType() {
		return 'movie';
	}

	async check() {
		// ffmpeg -i <name>.avi <name>.mov
		// exiftool -TagsFromFile <name>.avi <name>.mov

		return super.check();
	}
};
