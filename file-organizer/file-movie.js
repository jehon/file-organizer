
const FileExiv = require('./file-exiv.js');
// const fileUtils = require('./file-utils.js');

module.exports = class FileMovie extends FileExiv {
	getType() {
		return 'movie';
	}

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
