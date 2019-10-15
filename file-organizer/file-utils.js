/**
 * Conventions
 *   - path include filename and extension
 *   - filename = without extension
 *   - extension = .blabla
 */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const debug = require('debug')('file-utils');
const debugExec = debug.extend('exec');

function getDirname(relativePath) {
	return path.parse(relativePath).dir;
}

function getFullFilename(relativePath) {
	return path.parse(relativePath).base;
}

function getFilename(relativePath) {
	return path.parse(relativePath).name;
}

function getExtension(relativePath) {
	return path.parse(relativePath).ext;
}


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

async function fileDelete(filePath) {
	return fs.promises.unlink(filePath);
}

async function checkAndReserveName(filePath, forMe) {
	if (isReservedNameForMe(filePath, forMe)) {
		return true;
	}

	if (isReservedNameForSomeoneElse(filePath, forMe)) {
		throw 'already reserved';
	}

	if (isReleasedName(filePath)) {
		return true;
	}

	return fs.promises.stat(filePath)
		.then(() => {
			// If it exists, we can't reserve it...
			throw 'exists on disk';
		}, () => {
			// If it does not, then let's reserve it...
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
			throw new Error(`A file with the same name already exists (${filePathDest} from ${filePathOriginal}) (${e})`);
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
	getDirname,
	getFullFilename,
	getFilename,
	getExtension,
	fileDelete,
	fileRename,
	fileExec,
	checkAndReserveName,
};
