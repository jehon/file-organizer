
import fs from 'fs';
import path from 'path';
import File from './file-types/file.js';
import fileUtils from '../../file-organizer/file-utils.js';

import pLimit from 'p-limit'; // https://www.npmjs.com/package/p-limit
const renameLimiter = pLimit(1);

// import Task from './task.js';

// export class TaskFileDelete extends Task {
//     constructor() {
//         super('Delete file', () =>
//             fs.promises.unlink((/** @type {module:src/main/file-types.File} */(this.parent)).currentFilePath)
//         );
//     }
// }

/**
 * Delete a file and update values
 *
 * @param {File} file to be deleted
 * @returns {Promise<*>} when finished
 */
export async function fileDelete(file) {
    return fs.promises.unlink(file.currentFilePath)
        .then(() => {
            file.get(File.I_FILENAME).fix(null);
        });
}

/**
 * Rename a file according to its values
 *
 * TODO (indexed): //ise it
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
        fileUtils.fileRename(file.currentFilePath, newPath)
            .then(() => {
                vExt.fix();
                vFName.fix();
            })
    );

}