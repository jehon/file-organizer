
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

// async iterate(apply) {
//     return Promise.resolve(this)
//         .then(() => this.getList())
//         .then(list => Promise.all(list.map(
//             // Iterate on each child
//             f => f.iterate(apply)
//         )))
//         // Iterate on us-self
//         .then(() => super.iterate(apply));
// }
