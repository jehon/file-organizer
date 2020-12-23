
import fs from 'fs';
import path from 'path';

import { rootDir } from './main-constants.js';

/**
 * @param {string} folder where to search (absolute or relative to project root)
 * @param {RegExp} regExpMask to select files
 * @returns {Promise<Array<object>>} what the modules does export
 */
export default async function (folder, regExpMask = /[.]js/) {
    if (folder[0] != '/') {
        folder = path.join(rootDir, folder);
    }

    let list = (await fs.promises.readdir(folder))
        .filter(v => regExpMask.test(v))
        .map(v => path.join(folder, v));
    return await Promise.all(
        list.map(f => import(f)
            .catch(e => {
                console.error(`Error loading: ${f}:`, e);
            }))
    );
}
