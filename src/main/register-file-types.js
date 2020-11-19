
import fs from 'fs';
import fileUtils from '../../file-organizer/file-utils.js';
import FileGeneric from '../../file-organizer/file-generic.js';
import File from './file-types/file.js';

// TODO: object should be "class constructor"
/**
 * @type {Map<RegExp, object>} to store all mapping
 */
export const regExpMap = new Map();
let folderClass = null;

/**
 * @param {string|Array<string>} glob - extension to match (*.xxx)
 * @param {object} classConstructor - that match it
 */
export function registerGlob(glob, classConstructor) {
    if (Array.isArray(glob)) {
        for (const g of glob) {
            registerGlob(g, classConstructor);
        }
        return;
    }

    const oneGlob = /** @type {string} */(glob);

    const regExp = new RegExp('^'
        + oneGlob
            .split('.').join('[.]')
            .split('*').join('[^/]*')
            .split('?').join('[^/]')
        + '$', 'i');

    registerRegex(regExp, classConstructor);
}

/**
 * @param {RegExp|Array<RegExp>} regExp - extension to match (*.xxx)
 * @param {object} classConstructor - that match it
 */
export function registerRegex(regExp, classConstructor) {
    if (Array.isArray(regExp)) {
        for (const r of regExp) {
            registerRegex(r, classConstructor);
        }
        return;
    }

    const oneRegExp = /** @type {RegExp} */(regExp);

    // if (regExpMatch.has(oneRegExp)) {
    //     throw new Error(`Registering impossible for ${classConstructor.name}: (${oneRegExp}) is already mapped to ${regExpMatch.get(oneRegExp).name}`);
    // }
    regExpMap.set(oneRegExp, classConstructor);
}

/**
 * @param {object} classConstructor - that match it
 */
export function registerFolder(classConstructor) {
    if (folderClass) {
        throw new Error(`Registering impossible for ${classConstructor.name}: folder is already mapped to ${folderClass.name}`);
    }
    folderClass = classConstructor;
}

/**
 * @param {object} classConstructor - that match it
 */
export function registerFallback(classConstructor) {
    registerRegex(/.*/, classConstructor);
}

/**
 * @param {string|FileGeneric|File} filepath to be build
 * @param {module:file-organizer/main/FileFolder} parent of the file
 * @returns {module:common/File} the File object
 */
export async function buildFile(filepath, parent = null) {
    // TODO: Legacy
    if (filepath instanceof FileGeneric) {
        return filepath;
    }

    // TODO: Legacy
    if (filepath instanceof File) {
        return filepath;
    }

    if (folderClass) {
        try {
            // Is it real? Let's go further
            const stat = fs.statSync(filepath);
            if (stat.isDirectory()) {
                return new (folderClass)(filepath, parent);
            }
        } catch {
            // ok
        }
    }

    const fname = fileUtils.getFullFilename(filepath);

    const regExps = Array.from(regExpMap.keys());
    regExps.sort((a, b) => (b.toString().length - a.toString().length));
    for (const key of regExps) {
        const classConstructor = regExpMap.get(key);
        // TODO: remove this horrible hack (file-folder)
        if (key.test && key.test(fname)) {
            return new classConstructor(filepath, parent);
        }
    }
    throw `No match found for ${filepath}`;
}

/**
 * @param {string|FileGeneric|File} filepath to be build
 * @param {module:file-organizer/main/FileFolder} parent of the file
 * @returns {module:common/FileFolder} the FileFolder object
 */
export function buildFolder(filepath, parent) {
    return new folderClass(filepath, parent);
}

/**
 * Reset map (used in testing only)
 */
export function _reset() {
    regExpMap.clear();
    folderClass = null;
}

/**
 * Backup the data (used in testing only)
 *
 * @returns {function(void): void} to restore the config
 */
export function _backup() {
    /**
     * @type {Map<RegExp, object>} to store all mapping
     */
    const b_regExpMap = new Map(regExpMap);
    const b_folderClass = folderClass;
    _reset();

    return function restore() {
        _reset();
        folderClass = b_folderClass;
        for (const [k, v] of b_regExpMap) {
            regExpMap.set(k, v);
        }
    };
}
