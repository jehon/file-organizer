
const fileUtils = require('./file-utils.js');
const FileMovie = require('./file-movie.js');

function buildTargetName(filepath, newExtension) {
	return fileUtils.getDirname(filepath) + fileUtils.getFilename(filepath) + newExtension;
}

function convertAbstract(targetExtension, command, targetClass) {

}

function convertToMov(filepath) {
	return convertAbstract('.mov',
		() =>
		// ffmpeg -i <name>.avi <name>.mov
			fileUtils.fileExec('ffmpeg', '-i', filepath, buildTargetName(filepath, '.mov'))
			// exiftool -TagsFromFile <name>.avi <name>.mov
				.then(() => fileUtils.fileExec('exiftool', '-TagsFromFile', filepath, buildTargetName(filepath, '.mov'))),
		FileMovie
	);
}

module.exports = {
	convertAbstract,
	convertToMov
};