
const { app, BrowserWindow } = require('electron');
const path = require('path');

const options = require('./file-organizer/options.js');
const { notify } = require('./file-organizer/messenger.js');

options.headless = false;

function send(channel, data) {
    BrowserWindow.getAllWindows().forEach(b => b.webContents.send(channel, data));
}

app.whenReady()
    .then(() => {
        const mainWindow = new BrowserWindow();
        mainWindow.loadFile(path.join(__dirname, 'file-organizer/renderer/demo.html'));
        mainWindow.webContents.on('dom-ready', () => {
            // TODO: here


        });
    });
