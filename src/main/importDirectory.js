
import fs from 'fs';
import path from 'path';

import { rootDir } from '../common/constants.js';

/**
 * @param {string} folder where to search (absolute or relative to project root)
 * @returns {Promise<Array<object>>} what the modules does export
 */
export default function (folder) {
    if (folder[0] != '/') {
        folder = path.join(rootDir, folder);
    }

    return fs.promises.readdir(folder)
        .then(list => list.filter(v => v.endsWith('.js')))
        .then((list) => Promise.all(
            list.map(f => import(path.join(folder, f)))
        ));
}
