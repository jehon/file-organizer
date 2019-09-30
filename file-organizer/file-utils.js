
const spawn = require('spawn-promise');

const fs = require('fs-extra');

async function fileExists(filePath) {
	return fs.pathExists(filePath); // fs-extra dependency
}

async function fileDelete(filePath) {
	return fs.promises.unlink(filePath);
}

async function fileRename(filePathOriginal, filePathDest) {
	if (filePathOriginal == filePathDest) {
		return true;
	}

	try {
		if (filePathOriginal.toUpperCase() == filePathDest.toUpperCase()) {
			return fileRename(filePathOriginal, filePathOriginal + '.case')
				.then(() => fileRename(filePathOriginal + '.case', filePathDest))
				.then(() => true);
		} else {
			if (await fileExists(filePathDest)) {
				throw new Error(`A file with the same name already exists (${filePathDest} from ${filePathOriginal})`);
			}
			return fileExec('mv', [ filePathOriginal, filePathDest ])
				// .then(buffer => console.log(buffer.toString()))
				.then(() => true);
		}
	} catch (e) {
		throw Error('Error in fileRename: ', e);
	}
}

async function fileExec(file, params = []) {
	return spawn(file, params)
		.catch(res => {
			// console.error(res);
			throw Error(res);
		})
		.then(logBuffer => logBuffer ? logBuffer.toString() : '')
	;
}

module.exports = {
	fileExists,
	fileDelete,
	fileRename,
	fileExec
};
