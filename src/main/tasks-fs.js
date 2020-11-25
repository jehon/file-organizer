
import fs from 'fs';
import File from './file-types/file.js';

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
            file.get(File.I_EXTENSION).fix(null);
        });
}