
const spawn = require('spawn-promise');
const debug = require('debug')('file-utils');
const debugExec = debug.extend('exec');

const fs = require('fs');

async function fileExists(filePath) {
	return fs.promises.stat(filePath)
		.then(() => true)
		.catch(() => false);
	// return fs.pathExists(filePath); // fs-extra dependency
}

async function fileDelete(filePath) {
	return fs.promises.unlink(filePath);
}

const reservedNames = new Set();
const releasedNames = new Set();

async function checkAndReserveName(filePath) {
	if (reservedNames.has(filePath.toUpperCase())) {
		throw false;
	}
	if (releasedNames.has(filePath.toUpperCase())) {
		return true;
	}
	return fileExists(filePath)
		.then(doExists => {
			if (doExists) {
				throw false;
			}
			reservedNames.add(filePath.toUpperCase());
			return true;
		});
}

function freeReservedName(filePath) {
	reservedNames.delete(filePath.toUpperCase());
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

	releasedNames.add(filePathOriginal.toUpperCase());

	return checkAndReserveName(filePathDest)
		.catch((e) => {
			console.error(e);
			throw new Error(`A file with the same name already exists (${filePathDest} from ${filePathOriginal})`);
		})
		.then(() => fs.promises.rename(filePathOriginal, filePathDest ))
		.then(() => reservedNames.delete(filePathDest.toUpperCase()))
		.then(() => releasedNames.delete(filePathOriginal.toUpperCase()))
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
	// TODO(cleanup): Should not be exposed
	freeReservedName
};
