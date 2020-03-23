
// const { BrowserWindow } = require('electron');

let id = 0;

module.exports.getEntityId = function () {
    return id++;
};

module.exports.notify = function (channel, data) {
    console.info(channel, ': ', JSON.stringify(data));
    // if (BrowserWindow) {
    //     BrowserWindow.getAllWindows().forEach(b => b.webContents.send(channel, data));
    // }
};

module.exports.notify('main', 'started');
