
import minimatch from 'minimatch';
import fs from 'fs';

const globMap = new Map();

/**
 * @param {string} glob - extension to match (*.xxx)
 * @param {object} classConstructor - that match it
 */
export function registerGlob(glob, classConstructor) {
    if (globMap.has(glob)) {
        throw new Error(`Registering impossible for ${classConstructor.name}: ${glob} is already mapped to ${classConstructor.name}`);
    }
    globMap.set(glob, classConstructor);
}

/**
 * @param {object} classConstructor - that match it
 */
export function registerFolder(classConstructor) {
    registerGlob('/', classConstructor);
}

/**
 * @param {object} classConstructor - that match it
 */
export function registerFallback(classConstructor) {
    registerGlob('*', classConstructor);
}

/**
 * @param {string} filepath to be build
 * @param {module:file-organizer/main/FileFolder} parent of the file
 * @returns {module:common/File} the File object
 */
export async function buildFile(filepath, parent = null) {
    if (globMap.has('/')) {
        try {
            // Is it real? Let's go further
            const stat = await fs.promises.stat(filepath);
            if (stat.isDirectory()) {
                return new (globMap.get('/'))(filepath, parent);
            }
        } catch {
            // ok
        }
    }

    const globs = Array.from(globMap.keys());
    globs.sort((a, b) => (b.length - a.length));
    for (const key of globs) {
        const classConstructor = globMap.get(key);
        if (minimatch(filepath, key, {
            nocomment: true,
            nocase: true
        })) {
            return new classConstructor(filepath, parent);
        }
    }
    throw `No match found for ${filepath}`;
}

/**
 * Reset map (used in testing only)
 */
export function _reset() {
    globMap.clear();
}

/**
 * Load the map with files in the folder
 *
 * @param {string} _folder - relative folder where to find the file types
 */
export async function loadFolder(_folder) {
}