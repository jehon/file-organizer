
const FileMovie = require('./file-movie.js');
// const fileUtils = require('./file-utils.js');

module.exports = class FileMovieMov extends FileMovie {
	get constExivTS() { return 'CreateDate'; }

	check() {
	// 	this.addMessageConvert(
	// 		'CONVERT_MOV',
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
