
import path, { dirname } from 'path';

/**
 * @param {object|string} meta from import.meta
 * @returns {string} the test name
 */
export function t(meta) {
    const url = (typeof (meta) == 'object' && 'url' in meta) ? meta.url : meta;
    return new URL(url).pathname.split('/').pop();
}

/**
 * @param {*} meta the meta object from import.meta
 * @returns {string} the pathname
 */
export function __filename(meta) {
    const url = (typeof (meta) == 'object' && 'url' in meta) ? meta.url : meta;
    return new URL(url).pathname;
}

/**
 * @param {*} meta the meta object from import.meta
 * @returns {string} the dirname
 */
export function __dirname(meta) {
    const url = (typeof (meta) == 'object' && 'url' in meta) ? meta.url : meta;
    return dirname(new URL(url).pathname);
}

export const fromCWD = (...args) => path.join(process.cwd(), ...args);
export const rootPath = (...args) => path.join((path.dirname(__dirname(import.meta))), ...args);

// Test
export const dataPath = (...args) => rootPath('test', 'data', ...args);
export const tempPath = (...args) => rootPath('tmp', 'unit', ...args);
