
// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');

if (app) {
    app.whenReady()
        .then(() => {
            const mainWindow = new BrowserWindow();
            mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
        });
} else {
    console.info('No app found, not launching gui');
}
