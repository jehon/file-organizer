
const ipcRenderer = require('electron').ipcRenderer;

const history = new Map();
import { CHANNEL_MAIN } from '../common/constants.js';

/**
 * @param id
 */
function n(id) {
    return '' + id;
}

ipcRenderer.setMaxListeners(1000 * 1000);

/**
 * @param cb
 */
export function listener(cb) {
    /**
     * @param cb
     * @param data
     */
    function send(cb, data) {
        // To have the same treatment in history and direct call
        cb(data.type, data.id, data.status, data);
    }

    for (const [_key, data] of history) {
        send(cb, data);
    }

    const fn = (_event, data) => {
        history.set(n(data.id), data);
        send(cb, data);
    };

    ipcRenderer.on(CHANNEL_MAIN, fn);

    return () => ipcRenderer.off(CHANNEL_MAIN, fn);
}

/**
 * @param id
 * @param cb
 */
export function listenerForId(id, cb) {
    return listener((_type, cb_id, status, data) => {
        if (id == cb_id) {
            cb(status, data);
        }
    });
}

/**
 * @param type
 * @param cb
 */
export function listenerForType(type, cb) {
    return listener((cb_type, id, status, data) => {
        if (type == cb_type) {
            cb(id, status, data);
        }
    });
}

/**
 * @param parent_id
 * @param cb
 */
export function listenerForParent(parent_id, cb) {
    return listener((_type, id, status, data) => {
        if (data.parent == parent_id) {
            cb(id, status, data);
        }
    });
}
