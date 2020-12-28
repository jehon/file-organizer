
import path from 'path';
import fs from 'fs';

import Item from '../../src/main/item.js';

import { dataPath, tempPath } from '../test-helper.js';
export * from '../test-helper.js';

/**
 * Create a new file and returns its path
 * The file is a copy of the original one
 *
 * @param {string} subPath of the file to be copied
 * @param {string} inFolder if to be created in subfolder
 * @returns {Promise<string>} the path of the new file
 */
export async function createFileFrom(subPath, inFolder = '') {
    const fullSource = dataPath(subPath);
    const newName = path.parse(fullSource).base;
    const where = path.join(tempPath(inFolder));
    const target = path.join(where, newName);

    await fs.promises.mkdir(where, { recursive: true });
    await fs.promises.copyFile(fullSource, target);

    return target;
}

/**
 *
 */
export function listenForItemNotify() {
    spyOn(Item.prototype, 'notify').and.callThrough();
}

/**
 * Caution: this records call to the notify function
 *          and the status sent are not the status notified
 *          but the statuses requested
 *
 * @param {module:src/main/Item} item to listen to
 * @returns {Array<string>} all the statuses calls
 */
function _getNotifyCallsForItem(item) {
    // When creating a file, it notifies the creation of the parent's
    // we does need to filter on this
    const list = Item.prototype.notify.calls.all()
        .filter(data => data.object.id == item.id)
        .map(data => data.args[0]);
    return list;
}

/**
 * @param {module:src/main/Item} item to listen to
 * @returns {Array<string>} all the status' changes
 */
export function getStatusChangesForItem(item) {
    return _getNotifyCallsForItem(item)
        .filter(a => a)
        // We can also notify explicitely with the same value
        // so we need to filter consecutively same status
        .filter((val, i, arr) => ((i == 0) || (arr[i - 1] != val)));
}
