
const ipcRenderer = require('electron').ipcRenderer;

const history = new Map();
import { CHANNEL_MAIN } from '../common/constants.js';

/**
 * @param {number} id to be stringified
 * @returns {string} id stringified
 */
function n(id) {
    return '' + id;
}

ipcRenderer.setMaxListeners(1000 * 1000);

/**
 * @param {function(object):any} cb to be called
 * @returns {function(void):void} to stop listening
 */
export function listener(cb) {
    // Callback (to allow unregistering)
    const fn = (_event, data) => {
        history.set(n(data.id), data);
        cb(data);
    };

    // Register the callback
    ipcRenderer.on(CHANNEL_MAIN, fn);

    // Call the cb for any value already received (history)
    for (const data in history.values()) {
        cb(data);
    }

    return () => ipcRenderer.off(CHANNEL_MAIN, fn);
}

/**
 * @param {string} id to listen
 * @param {function(object): void} cb to be called
 * @returns {function(void):void} to stop listening
 */
export const listenerForId = (id, cb) => listener(data =>
    (id == data.id) ? cb(data) : null);
