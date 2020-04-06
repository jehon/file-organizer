
// Modules to control application life and create native browser window
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const { CHANNEL_MAIN } = require('./constants.js');

// Remove warning: https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true;

const { register } = require('./main/messenger.js');
const options = require('./options.js');

if (app) {

    app.whenReady()
        .then(() => {
            const { width, height } = screen.getPrimaryDisplay().workAreaSize;

            const mainWindow = new BrowserWindow({
                width: Math.min(1024, Math.floor(parseInt(width) * 0.8)),
                height: Math.min(800, Math.floor(parseInt(height) * 0.8)),
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

    // Close (exit) when all windows are closed
    app.on('window-all-closed', function () {
        if (!options.headless) {
            app.quit();
        }
    });
} else {
    console.info('No app found, not launching gui');
}
