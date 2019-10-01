
const spawn = require('spawn-promise');
const debug = require('debug')('file-utils');
const debugExec = debug.extend('exec');

const fs = require('fs-extra');

async function fileExists(filePath) {
	return fs.pathExists(filePath); // fs-extra dependency
}

async function fileDelete(filePath) {
	return fs.promises.unlink(filePath);
}

const reservedNames = [];
async function checkAndReserveName(filePath) {
	if (reservedNames.includes(filePath)) {
		throw false;
	}
	return fileExists(filePath)
		.then(doExists => {
			if (doExists) {
				throw false;
			}
			reservedNames.push(filePath);
			return true;
		});
}

function freeReservedName(filePath) {
	const i = reservedNames.indexOf(filePath);
	if (i < 0) {
		return;
	}
	reservedNames.splice(i, 1);
}

async function fileRename(filePathOriginal, filePathDest) {
	if (filePathOriginal == filePathDest) {
		return true;
	}

	if (filePathOriginal.toUpperCase() == filePathDest.toUpperCase()) {
		return fileRename(filePathOriginal, filePathOriginal + '.case')
			.then(() => fileRename(filePathOriginal + '.case', filePathDest))
			.then(() => true);
	} else {
		return fileExists(filePathDest)
			.then(doExists => {
				if (doExists) {
					throw new Error(`A file with the same name already exists (${filePathDest} from ${filePathOriginal})`);
				}
			})
			.then(() => fileExec('mv', [ filePathOriginal, filePathDest ]))
		// .then(buffer => console.log(buffer.toString()))
			.then(() => true)
		;
	}
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
	freeReservedName
};
