
import File from './file-types/file.js';

/**
 * @param {File} file as the root of the change
 * @param {function(File):Promise<any>} func to be applied
 * @returns {Promise<object>} applied on the file
 */
export default async function iterate(file, func) {
    let res = {
        [file.currentFilePath]: await func(file)
    };

    for (const f of file.children) {
        res = {
            ...res,
            ...(await iterate(f, func))
        };
    }

    return res;
}
