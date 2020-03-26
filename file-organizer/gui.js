
// Modules to control application life and create native browser window
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const { CHANNEL_MAIN } = require('./constants.js');

const { register } = require('./messenger.js');

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
            mainWindow.webContents.on('dom-ready', () => register((data) => {
                BrowserWindow.getAllWindows().forEach(b => b.webContents.send(CHANNEL_MAIN, data));
            }));
            mainWindow.webContents.openDevTools();
        });
} else {
    console.info('No app found, not launching gui');
}
