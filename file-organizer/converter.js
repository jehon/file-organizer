
const fs = require('fs');

const fileUtils = require('./file-utils.js');
const FileMovie = require('./file-movie.js');
const messages = require('./messages.js');

function buildTargetName(filepath, newExtension) {
	return fileUtils.getDirname(filepath) + fileUtils.getFilename(filepath) + newExtension;
}

async function convertAbstract(filepath, targetExtension, targetClass, command) {
	const targetFilename = buildTargetName(filepath, targetExtension);
	const targetFile = new (targetClass)(targetFilename);
	await messages.fileCommit(targetFile,
		`FILE_CONVERT${targetExtension.replace('.', '_')}`,
		`Converting to ${targetExtension}`,
		targetExtension,
		command);
	await fs.promises.mkdir('converted/', { recursive: true });
	await fs.promises.rename(filepath, 'converted/' + filepath.split('/').join('_'));
	return targetFile;
}

async function convertToMov(filepath) {
	return convertAbstract(
		filepath,
		'.mov',
		FileMovie,
		() =>
			// ffmpeg -i <name>.avi <name>.mov
			fileUtils.fileExec('ffmpeg', '-i', filepath, buildTargetName(filepath, '.mov'))
				// exiftool -TagsFromFile <name>.avi <name>.mov
				.then(() => fileUtils.fileExec('exiftool', '-TagsFromFile', filepath, buildTargetName(filepath, '.mov'))),
	);
}

const converterMixin = (target) => class extends target {
	async loadData() {
		return super.loadData();
	}

	async check() {
		return super.check();
	}
};

module.exports = {
	convertToMov
};