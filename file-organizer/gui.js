
// Modules to control application life and create native browser window
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

const { register } = require('./messenger.js');

function onEvent(channel, data) {
    BrowserWindow.getAllWindows().forEach(b => b.webContents.send('' + channel, data));
}

if (app) {
    app.whenReady()
        .then(() => {
            const { width, height } = screen.getPrimaryDisplay().workAreaSize;

            const mainWindow = new BrowserWindow({
                width: Math.floor(parseInt(width) * 0.8),
                height: Math.floor(parseInt(height) * 0.8),
                webPreferences: {
                    nodeIntegration: true
                }
            });
            mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
            mainWindow.webContents.on('dom-ready', () => register(onEvent));
            mainWindow.webContents.openDevTools();
        });
} else {
    console.info('No app found, not launching gui');
}
