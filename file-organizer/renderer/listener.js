
const ipcRenderer = require('electron').ipcRenderer;

const history = new Map();
const { CHANNEL_MAIN } = require('../constants.js');

function n(id) {
    return "" + id;
}

module.exports.listener = function (cb) {
    function send(cb, data) {
        // To have the same treatment in history and direct call
        cb(data.type, data.id, data.status, data);
    }

    for (const [_key, data] of history) {
        send(cb, data);
    }

    ipcRenderer.on(CHANNEL_MAIN, (_event, data) => {
        history.set(n(data.id), data);
        send(cb, data);
    });
};

module.exports.listenerForId = function (id, cb) {
    module.exports.listener((_type, cb_id, status, data) => {
        if (id == cb_id) {
            cb(status, data);
        }
    })
};

module.exports.listenerForType = function (type, cb) {
    module.exports.listener((cb_type, id, status, data) => {
        if (type == cb_type) {
            cb(id, status, data);
        }
    })
};
