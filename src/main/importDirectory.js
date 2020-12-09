
import fs from 'fs';
import path from 'path';

import { rootDir } from './main-constants.js';

/**
 * @param {string} folder where to search (absolute or relative to project root)
 * @param {RegExp} regExpMask to select files
 * @returns {Promise<Array<object>>} what the modules does export
 */
export default function (folder, regExpMask = /[.]js/) {
    if (folder[0] != '/') {
        folder = path.join(rootDir, folder);
    }

    return fs.promises.readdir(folder)
        .then(list => list.filter(v => regExpMask.test(v)))
        .then(list => list.map(v => path.join(folder, v)))
        .then((list) => Promise.all(
            list.map(f => import(f).catch(e => {
                console.error(`Error loading: ${f}:`, e);
            }))
        ));
}
