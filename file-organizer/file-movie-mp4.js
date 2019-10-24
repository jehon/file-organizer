
const FileMovie = require('./file-movie.js');
// const fileUtils = require('./file-utils.js');

module.exports = class FileMovieMP4 extends FileMovie {
	get constExifTS() { return 'CreateDate'; }

	check() {
		// Thanks to https://stackoverflow.com/a/40077776/1954789
		// does not work everytimes...
		// case '.mkv': --> ffmpeg -i filename.mkv -vcodec copy -acodec copy 1.m4v
		// case '.mkv': --> ffmpeg -i filename.mkv -c copy 1.m4v


		// 	this.addMessageConvert(
		// 		'CONVERT_MP4',
		// 		'.mov',
		// 		(originalPath, targetPath) =>
		// 			// ffmpeg -i <name>.avi <name>.mov
		// 			fileUtils.fileExec('ffmpeg', '-i', originalPath, targetPath)
		// 				// exiftool -TagsFromFile <name>.avi <name>.mov
		// 				.then(() => fileUtils.fileExec('exiftool', '-TagsFromFile', originalPath, targetPath)),
		// 	);
		return super.check();
	}
};
