
const childProcess = require('child_process');
const debug = require('debug')('file-utils');
const debugExec = debug.extend('exec');

const fs = require('fs');

const reservedNames = new Map();
const releasedNames = new Set();

function reserveNameForMe(filePath, forMe) {
	reservedNames.set(filePath.toUpperCase(), forMe);
	releasedNames.delete(filePath.toUpperCase());
}

function isReservedNameForSomeoneElse(filePath, forMe) {
	return reservedNames.has(filePath.toUpperCase()) && reservedNames.get(filePath.toUpperCase()) != forMe;
}

function isReservedNameForMe(filePath, forMe) {
	return reservedNames.has(filePath.toUpperCase()) && reservedNames.get(filePath.toUpperCase()) == forMe;
}

function releaseName(filePath) {
	reservedNames.delete(filePath.toUpperCase());
	releasedNames.add(filePath.toUpperCase());
}
function isReleasedName(filePath) {
	return reservedNames.has(filePath.toUpperCase());
}


// TODO(indexed): privatise this function ?
// (used in file-generic-test.js and file-timestamp-test.js -> helper / in file-timestamp.js -> reservation instead)
async function fileExists(filePath) {
	return fs.promises.stat(filePath)
		.then(() => true)
		.catch(() => false);
}

async function fileDelete(filePath) {
	return fs.promises.unlink(filePath);
}

async function checkAndReserveName(filePath, forMe) {
	if (isReservedNameForMe(filePath, forMe)) {
		return true;
	}

	if (isReservedNameForSomeoneElse(filePath, forMe)) {
		throw false;
	}

	if (isReleasedName(filePath)) {
		return true;
	}

	return fileExists(filePath)
		.then(doExists => {
			if (doExists) {
				throw false;
			}
			reserveNameForMe(filePath, forMe);
			return true;
		});
}

async function fileRename(filePathOriginal, filePathDest) {
	if (filePathOriginal == filePathDest) {
		return true;
	}

	if (filePathOriginal.toUpperCase() == filePathDest.toUpperCase()) {
		return fileRename(filePathOriginal, filePathOriginal + '.case')
			.then(() => fileRename(filePathOriginal + '.case', filePathDest))
			.then(() => true);
	}

	releaseName(filePathOriginal);

	return checkAndReserveName(filePathDest, filePathOriginal)
		.catch((e) => {
			console.error(e);
			throw new Error(`A file with the same name already exists (${filePathDest} from ${filePathOriginal})`);
		})
		.then(() => fs.promises.rename(filePathOriginal, filePathDest ))
		.then(() => releaseName(filePathDest))
		.then(() => true);
}

async function fileExec(file, params = []) {
	debugExec(file, ...params);
	return new Promise((resolve, reject) => {
		childProcess.execFile(file, params, (error, stdout, stderr) => {
			debugExec(file, ...params, '->', stdout, stderr, error);
			if (! stdout) {
				stdout = '';
			}
			if (! stderr) {
				stderr = '';
			}
			if (error) {
				error.stdout = stdout;
				error.stderr = stderr;
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
}

module.exports = {
	fileExists,
	fileDelete,
	fileRename,
	fileExec,
	checkAndReserveName,
};
