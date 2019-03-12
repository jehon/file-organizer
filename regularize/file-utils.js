
const path = require('path');
const util = require('util');
var spawnSync = require('child_process').spawnSync;

const fs = require('fs-extra');

async function fileExists(filePath) {
	return await fs.pathExists(filePath); // fs-extra dependency
}

async function fileDelete(filePath) {
	return await util.promisify(fs.unlink)(filePath);
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
			spawnSync('mv', [ filePathOriginal, filePathDest ]).stdout.toString();
		}
		return true;
	} catch (e) {
		throw Error('Error in fileRename: ', e);
	}
}

/**
 *
 * @param {string} dir (without filename)
 * @param {string} filename (without extension)
 * @param {string} existingFilename (without extension)
 * @param {string} extension (.blabla)
 */
async function findIndexedFilename(dir, filename, existingFilename, extension) {
	const proposition = (i) => (filename + (i == 0 ? '' : '~' + i));

	let i = 0;
	while ((await fileExists(path.join(dir, proposition(i) + extension)))
			&& (existingFilename != proposition(i))) {
		i++;
	}

	return proposition(i);
}

function fileExec(file, params = [], options = {}) {
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
	findIndexedFilename,
	fileRename,
	fileExec
};
