
// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const { register } = require('./messenger.js');
const path = require('path');

function onEvent(channel, data) {
    BrowserWindow.getAllWindows().forEach(b => b.webContents.send(channel, data));
}

if (app) {
    app.whenReady()
        .then(() => {
            const mainWindow = new BrowserWindow();
            mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
            mainWindow.webContents.on('dom-ready', () => register(onEvent));
        });
} else {
    console.info('No app found, not launching gui');
}
