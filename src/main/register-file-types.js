
import fs from 'fs';
import fileUtils from '../../file-organizer/file-utils.js';

// TODO(style): object should be "class constructor"
/**
 * @type {Map<RegExp, object>} to store all mapping for files
 */
export const _regExpMapForFiles = new Map();

/**
 * @type {Map<RegExp, object>} to store all mapping for folders
 */
export const _regExpMapForFolders = new Map();

export const FallBackRegExp = /.*/;

// /**
//  * Because regexp are object, == does not work
//  * so we search for the initial object
//  *
//  * @param {Map} map to search in
//  * @param {RegExp} regexp to search for
//  * @returns {RegExp} found in the map
//  */
// function getRegExpInMap(map, regexp) {
//     for (const key of map.keys()) {
//         if (key.toString() == regexp.toString()) {
//             return key;
//         }
//     }
//     return null;
// }

/**
 * @param {string} glob a glob (*?)
 * @returns { RegExp} matching the glob
 */
export function glob2regExp(glob) {
    return new RegExp('^'
        + glob
            .split('.').join('[.]')
            .split('*').join('[^/]*')
            .split('?').join('[^/]')
        + '$', 'i');

}

/**
 * @param {RegExp|Array<RegExp>} regExp - extension to match (*.xxx)
 * @param {object} classConstructor - that match it
 * @param {object} options - options
 * @property {boolean} forFiles if it applies to files
 * @property {boolean} forFolders if it applies to folders
 */
export function registerRegExp(regExp, classConstructor, options = {}) {
    if (Array.isArray(regExp)) {
        for (const r of regExp) {
            registerRegExp(r, classConstructor, options);
        }
        return;
    }

    const oneRegExp = /** @type {RegExp} */(regExp);

    // TODO: handle duplicates
    // if (regExpMatch.has(oneRegExp)) {
    //     throw new Error(`Registering impossible for ${classConstructor.name}: (${oneRegExp}) is already mapped to ${regExpMatch.get(oneRegExp).name}`);
    // }

    if (options.forFiles) {
        _regExpMapForFiles.set(oneRegExp, classConstructor);
    }
    if (options.forFolders) {
        _regExpMapForFolders.set(oneRegExp, classConstructor);
    }
}

/**
 * @param {Map<RegExp,object>} regExpMap where to search
 * @param {string} filepath of the file
 * @param {module:file-organizer/main/FileFolder} parent of the file
 * @returns {module:common/File} the File object
 */
function _getClassFromMap(regExpMap, filepath, parent) {
    const fname = fileUtils.getFullFilename(filepath);

    const regExps = Array.from(regExpMap.keys());
    regExps.sort((a, b) => (b.toString().length - a.toString().length));
    for (const key of regExps) {
        const classConstructor = regExpMap.get(key);

        if (key.test(fname)) {
            return new classConstructor(filepath, parent);
        }
    }

    throw `No match found for ${filepath}`;
}

/**
 * This function is called in constructor of File, so it must be SYNC
 *
 * @param {string|object} filepath to be build
 * @param {module:file-organizer/main/FileFolder} parent of the file
 * @returns {module:common/File} the File object
 */
export function buildFile(filepath, parent = null) {
    // TODO(migration): accept File and FileGeneric as it
    if (typeof filepath == 'object') {
        return filepath;
    }

    try {
        if (fs.statSync(filepath).isDirectory()) {
            return _getClassFromMap(_regExpMapForFolders, filepath, parent);
        }
    } catch {
        // For testing purpose, if a file does not exists, it is not a folder
    }

    return _getClassFromMap(_regExpMapForFiles, filepath, parent);
}

/**
 * Backup the data (used in testing only)
 *
 * @returns {function(void): void} to restore the config
 */
export function _backup() {
    //
    // We can not make a reset because we need some of the files in there
    //

    const b_regExpMapForFiles = new Map(_regExpMapForFiles);
    const b_regExpMapForFolders = new Map(_regExpMapForFolders);

    return function restore() {
        _regExpMapForFiles.clear();
        _regExpMapForFolders.clear();

        for (const [k, v] of b_regExpMapForFiles) {
            _regExpMapForFiles.set(k, v);
        }
        for (const [k, v] of b_regExpMapForFolders) {
            _regExpMapForFolders.set(k, v);
        }
    };
}
