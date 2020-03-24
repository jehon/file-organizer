
const ipcRenderer = require('electron').ipcRenderer;

const history = new Map();

function send(cb, data) {
    // To have the same treatment in history and direct call
    cb(data.type, data);
}

module.exports = function (channel, cb) {
    if (history.has(channel)) {
        const data = history.get(channel);
        send(cb, data);
    }

    ipcRenderer.on(channel, (_event, data) => {
        history.set(channel, data);
        send(cb, data);
    });
};
