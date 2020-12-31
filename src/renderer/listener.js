
const ipcRenderer = require('electron').ipcRenderer;

const history = new Map();
import { CHANNEL_MAIN } from '../common/constants.js';

ipcRenderer.setMaxListeners(1000 * 1000);

/**
 * @param {function(object):any} cb to be called
 * @returns {function(void):void} to stop listening
 */
export function listener(cb) {
    // Callback (to allow unregistering)
    const fn = (_event, data) => {
        if (!data.id || typeof (data.id) != 'number' || !data.type) {
            throw `Invalid data: no id or no type: ${JSON.stringify(data)}`;
        }

        history.set(data.id, data);
        cb(data);
    };

    // Register the callback
    ipcRenderer.on(CHANNEL_MAIN, fn);

    // Call the cb for any value already received (history)
    for (const data of history.values()) {
        cb(data);
    }

    return () => ipcRenderer.off(CHANNEL_MAIN, fn);
}
