
import path from 'path';
import fs from 'fs';

import File from '../../src/main/file-types/file.js';
import Item from '../../src/main/item.js';

import { __dirname } from '../test-helper.js';
import { buildFile } from '../../src/main/register-file-types.js';

const rootPath = (...args) => path.join((path.dirname(path.dirname(__dirname(import.meta)))), ...args);

// Test
export const dataPath = (...args) => rootPath('test', 'data', ...args);
export const tempPath = (...args) => rootPath('tmp', 'unit', ...args);

/**
 * @param {string} subPath source of the file
 * @param {string} inFolder of the file
 * @returns {File} - a copy ready for the test
 */
export async function createFileGeneric(subPath, inFolder = '') {
    const fullSource = dataPath(subPath);
    const newName = path.parse(fullSource).base;
    const where = path.join(tempPath(inFolder));

    fs.mkdirSync(where, { recursive: true });

    fs.copyFileSync(
        fullSource,
        path.join(where, newName)
    );

    return buildFile(path.join(where, newName))
        .then(f => f.loadData()
            .then(() => f)
        );
}

/**
 * @deprecated
 * @param subPath
 */
export async function createFileFrom(subPath) {
    const f = await createFileGeneric(subPath);
    if (f instanceof File) {
        return f;
    }
    return new File(f.getPath());
}

/**
 * @param filePath
 */
export async function fileExists(filePath) {
    return fs.promises.stat(filePath)
        .then(() => true)
        .catch(() => false);
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
