
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

// case '.m4v':  // 11  // TODO (extensions): unsupported
// case '.mkv':  // 1   // TODO (extensions): unsupported
// return new FileMovieMP4(filepath, parent);

