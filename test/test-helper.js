
import { dirname } from 'path';

/**
 * @param {object|string} meta from import.meta
 * @returns {string} the test name
 */
export function t(meta) {
    const url = (typeof (meta) == 'object' && 'url' in meta) ? meta.url : meta;
    return new URL(url).pathname.split('/').pop();
}

/**
 * @param meta
 */
export function __filename(meta) {
    const url = (typeof (meta) == 'object' && 'url' in meta) ? meta.url : meta;
    return new URL(url).pathname;
}

/**
 * @param meta
 */
export function __dirname(meta) {
    const url = (typeof (meta) == 'object' && 'url' in meta) ? meta.url : meta;
    return dirname(new URL(url).pathname);
}

