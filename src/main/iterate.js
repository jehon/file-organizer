
import path from 'path';

import File from './file-types/file.js';
import { buildFile } from './register-file-types.js';

/**
 * @param {File|module:file-generic/FileGeneric} file as the root of the change
 * @param {function(File):any} func to be applied
 * @returns {Promise<object>} applied on the file
 */
export default async function iterate(file, func) {
    let thisPath = file.currentFilePath ? file.currentFilePath : file.getPath();
    let res = {
        [thisPath]: await func(file)
    };

    let list = [];

    if (file.getList) {
        for (const fn in await file.getList()) {
            list.push(await buildFile(path.join(thisPath, fn)));
        }
    }

    if (file.children) {
        list = [...list, ...file.children];
    }

    for (const f of list) {
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
