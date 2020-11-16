
const FileMovie = require('./file-movie.js');
// const fileUtils = require('./file-utils.js');

module.exports = class FileMovieMov extends FileMovie {
    get constExifTS() { return 'CreateDate'; }

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


// case '.avi':  // 17  // TODO (extensions): unsupported
// case '.mpg':  // 29  // TODO (extensions): unsupported
// case '.mpeg': // ?   // TODO (extensions): unsupported
// case '.wmv':  // ?   // TODO (extensions): unsupported
// case '.mod':  // ?   // TODO (extensions): unsupported
// return new FileMovieMov(filepath, parent);
