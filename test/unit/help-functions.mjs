
import path from 'path';
import fs from 'fs';

import File from '../../file-organizer/main/file.js';
import Item from '../../file-organizer/main/item.js';

import { __dirname } from '../test-helper.js';
import { buildFile } from '../../src/main/register-file-types.js';

const rootPath = (...args) => path.join((path.dirname(path.dirname(__dirname(import.meta)))), ...args);

// Test
export const dataPath = (...args) => rootPath('test', 'data', ...args);
export const tempPath = (...args) => rootPath('tmp', 'unit', ...args);

/**
 * @param {string} subPath of the file
 * @returns {File} - a copy ready for the test
 */
export async function createFileGeneric(subPath) {
    const fullSource = dataPath(subPath);
    const newName = path.parse(fullSource).base;

    fs.copyFileSync(
        fullSource,
        path.join(tempPath(), newName)
    );

    return buildFile(path.join(tempPath(), newName))
        .then(f => f.loadData());
}

/**
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
 * @param f
 * @param i
 */
export function getNotifyCallsForFile(f, i = false) {
    // When creating a file, it notifies the creation of the parent's
    // we does need to filter on this
    const list = File.prototype.notify.calls.all()
        .filter(data => data.object.id == f.id)
        .map(data => data.args);
    if (i === false) {
        return list;
    }
    return list[i];
}

/**
 * @param f
 * @param i
 */
export function getNotifyCallsForItem(f, i = false) {
    // When creating a file, it notifies the creation of the parent's
    // we does need to filter on this
    const list = Item.prototype.notify.calls.all()
        .filter(data => data.object.id == f.id)
        .map(data => data.args);
    if (i === false) {
        return list;
    }
    return list[i];
}


/**
 * @param i
 */
export function getStatusHistoryForItem(i) {
    return getNotifyCallsForItem(i)
        .map(args => args[0])
        .filter(a => a);
}
