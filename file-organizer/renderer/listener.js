
const ipcRenderer = require('electron').ipcRenderer;

const history = new Map();
const { CHANNEL_MAIN } = require('../constants.js');

function n(id) {
    return '' + id;
}

ipcRenderer.setMaxListeners(1000 * 1000);

module.exports.listener = function (cb) {
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
};

module.exports.listenerForId = function (id, cb) {
    return module.exports.listener((_type, cb_id, status, data) => {
        if (id == cb_id) {
            cb(status, data);
        }
    });
};

module.exports.listenerForType = function (type, cb) {
    return module.exports.listener((cb_type, id, status, data) => {
        if (type == cb_type) {
            cb(id, status, data);
        }
    });
};

module.exports.listenerForParent = function (parent_id, cb) {
    return module.exports.listener((_type, id, status, data) => {
        if (data.parent == parent_id) {
            cb(id, status, data);
        }
    });
};
