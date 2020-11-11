
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
 * @param {function(string,string,object,*):any} cb to be called
 * @returns {function(void):void} to stop listening
 */
export function listener(cb) {
    /**
     * Call a callback
     *
     * @param {function(string,string,object,*):any} cb to be called
     * @param {*} data to be associated
     */
    function send(cb, data) {
        // To have the same treatment in history and direct call
        cb(data.type, data.id, data.status, data);
    }

    for (const data in history.values()) {
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
 * @param {string} id to listen
 * @param {function(string, *): void} cb to be called
 * @returns {function(void):void} to stop listening
 */
export function listenerForId(id, cb) {
    return listener((_type, cb_id, status, data) => {
        if (id == cb_id) {
            cb(status, data);
        }
    });
}

/**
 * @param {string} type to listen for
 * @param {function(string,string,*):void} cb to be called
 * @returns {function(void):void} to stop listening
 */
export function listenerForType(type, cb) {
    return listener((cb_type, id, status, data) => {
        if (type == cb_type) {
            cb(id, status, data);
        }
    });
}

/**
 * @param {string} parent_id to listen for
 * @param {function(string,string,*):void} cb to be called
 * @returns {function(void):void} to stop listening
 */
export function listenerForParent(parent_id, cb) {
    return listener((_type, id, status, data) => {
        if (data.parent == parent_id) {
            cb(id, status, data);
        }
    });
}
