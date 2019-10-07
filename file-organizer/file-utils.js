
const spawn = require('spawn-promise');
const debug = require('debug')('file-utils');
const debugExec = debug.extend('exec');

const fs = require('fs');

const reservedNames = new Map();
const releasedNames = new Set();

function reserveName(filePath, data = null) {
	reservedNames.set(filePath.toUpperCase(), data);
	releasedNames.delete(filePath.toUpperCase());
}
function isReservedName(filePath) {
	return reservedNames.has(filePath.toUpperCase());
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

async function checkAndReserveName(filePath) {
	if (isReservedName(filePath)) {
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
			reserveName(filePath);
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

	releaseName(filePathOriginal.toUpperCase());

	return checkAndReserveName(filePathDest)
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
	fileExec,
	checkAndReserveName,
};
