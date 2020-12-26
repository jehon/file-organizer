
import fs from 'fs';
import path from 'path';
import File from './file-types/file.js';

import pLimit from 'p-limit'; // https://www.npmjs.com/package/p-limit
const renameLimiter = pLimit(1);

/**
 * @param {string|File} file to be handled
 * @returns {string} the path
 */
function getPath(file) {
    if (typeof (file) == 'object') {
        return file.currentFilePath;
    }
    return file;
}

/**
 * Test if a file exists physically
 *
 * @param {string|File} file to be handled
 * @returns {Promise<boolean>} if the file exists
 */
export async function fileExistsPhysically(file) {
    return fs.promises.stat(getPath(file))
        .then(() => true)
        .catch(() => false);
}

/**
 * Delete a file and update values
 *
 * @param {string|File} file to be handled
 * @returns {Promise<*>} when finished
 */
export async function fileDeleteAndRelease(file) {
    const p = getPath(file);
    return fs.promises.unlink(p)
        .then(() => {
            releaseName(p);
            if (file instanceof File) {
                file.get(File.I_FILENAME).fix(null);
            }
        });
}

/**
 * Rename a file according to its values
 *
 * TODO(indexed): //ise it
 *
 * @param {File} file to be renamed according to values
 * @returns {Promise<void>} when finished
 */
export async function fileRename(file) {
    const vExt = file.get(File.I_EXTENSION);
    const vFName = file.get(File.I_FILENAME);

    if (vExt.isDone() && vFName.isDone()) {
        // Nothing to do
        return;
    }

    const newPath = path.join(file.parent.currentFilePath, vFName.expected + vExt.expected);

    // @Limited(1)
    // Only one at at time...
    return renameLimiter(() =>
        fileUtilsFileRename(file.currentFilePath, newPath)
            .then(() => {
                vExt.fix();
                vFName.fix();
            })
    );

}

/**
 * This function is used in constructor, so it must be SYNC
 *
 * @param {File} file to be searched
 * @returns {string[]} of relative filepath
 */
export function folderListing(file) {
    const list = fs.readdirSync(file.currentFilePath)
        .filter(f => f != '.' && f != '..');
    list.sort();
    return list;
}



/** TODO(indexed): Old code */


const reservedNames = new Map();
const releasedNames = new Set();

/**
 * @param {string} filePath of the file
 * @param {string} forMe if it is for me
 */
function reserveNameForMe(filePath, forMe) {
    reservedNames.set(filePath.toUpperCase(), forMe);
    releasedNames.delete(filePath.toUpperCase());
}

/**
 * @param {string} filePath of the file
 * @param {string} forMe if it is for me
 * @returns {boolean} if reservation is ok
 */
function isReservedNameForSomeoneElse(filePath, forMe) {
    return reservedNames.has(filePath.toUpperCase()) && reservedNames.get(filePath.toUpperCase()) != forMe;
}

/**
 * @param {string} filePath of the file
 * @param {string} forMe if it is for me
 * @returns {boolean} if reservation was ok
 */
function isReservedNameForMe(filePath, forMe) {
    return reservedNames.has(filePath.toUpperCase()) && reservedNames.get(filePath.toUpperCase()) == forMe;
}

/**
 * @param {string} filePath of the file
 */
function releaseName(filePath) {
    reservedNames.delete(filePath.toUpperCase());
    releasedNames.add(filePath.toUpperCase());
}
/**
 * @param {string} filePath of the file
 * @returns {boolean} if reservation is ok
 */
function isReleasedName(filePath) {
    return reservedNames.has(filePath.toUpperCase());
}

/**
 * @param {string} filePath of the file
 * @param {string} forMe if it is for me
 * @returns {Promise<boolean>} if reservation is ok
 */
export async function checkAndReserveName(filePath, forMe) {
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

/**
 * @param {string} filePathOriginal - from
 * @param {string} filePathDest - to
 * @returns {Promise<boolean>} if success
 */
export async function fileUtilsFileRename(filePathOriginal, filePathDest) {
    if (filePathOriginal == filePathDest) {
        return true;
    }

    if (filePathOriginal.toUpperCase() == filePathDest.toUpperCase()) {
        return fileUtilsFileRename(filePathOriginal, filePathOriginal + '.case')
            .then(() => fileUtilsFileRename(filePathOriginal + '.case', filePathDest))
            .then(() => true);
    }

    releaseName(filePathOriginal);

    return checkAndReserveName(filePathDest, filePathOriginal)
        .catch((e) => {
            throw new Error(`A file with the same name already exists (${filePathDest} from ${filePathOriginal}) (${e})`);
        })
        .then(() => fs.promises.rename(filePathOriginal, filePathDest))
        .then(() => releaseName(filePathDest))
        .then(() => true);
}
