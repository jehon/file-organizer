
const ipcRenderer = require('electron').ipcRenderer;

module.exports = function (channel, cb) {
    ipcRenderer.on(channel, (_event, data) => {
        cb(data);
    });
}
