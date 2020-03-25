
const ipcRenderer = require('electron').ipcRenderer;

const history = new Map();
const { CHANNEL_MAIN } = require('../constants.js');

module.exports.listener = function (cb) {
    function send(cb, data) {
        // To have the same treatment in history and direct call
        cb(data.id, data.type, data);
    }

    for (const [key, data] of history) {
        send(cb, data)
    }

    ipcRenderer.on(CHANNEL_MAIN, (_event, data) => {
        history.set(data.id, data);
        send(cb, data);
    });
};

module.exports.listenerFor = function (id, cb) {
    function sendIf(cb, data) {
        if (id == data.id) {
            // To have the same treatment in history and direct call
            cb(data.type, data);
        }
    }

    if (history.has(id)) {
        const data = history.get(id);
        sendIf(cb, data);
    }

    ipcRenderer.on('main', (_event, data) => {
        history.set(data.id, data);
        sendIf(cb, data);
    });

}
