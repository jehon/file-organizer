
var spawnSync = require('child_process').spawnSync;

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
			await fileRename(filePathOriginal, filePathOriginal + '.case');
			await fileRename(filePathOriginal + '.case', filePathDest);
		} else {
			if (await fileExists(filePathDest)) {
				throw new Error(`A file with the same name already exists (${filePathDest} from ${filePathOriginal})`);
			}
			spawnSync('mv', [ filePathOriginal, filePathDest ]).stdout.toString();
		}
		return true;
	} catch (e) {
		throw Error('Error in fileRename: ', e);
	}
}

async function fileExec(file, params = [], options = {}) {
	// try {
	const res = spawnSync(file, params, Object.assign({
		stdio: [ 'ignore', 'pipe', 'inherit' ]
	}, options));
	if (res.error) {
		throw res.error;
	}
	if (res.status > 0) {
		throw Error(`Process ${file} returned result ${res.status}`);
	}
	if (res.stdout) {
		return res.stdout.toString();
	}
	return '';
}

module.exports = {
	fileExists,
	fileDelete,
	fileRename,
	fileExec
};
