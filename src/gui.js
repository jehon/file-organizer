
import path from 'path';

import { CHANNEL_MAIN } from './common/constants.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Modules to control application life and create native browser window
const { app, BrowserWindow, screen } = require('electron');


// Remove warning: https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true;

import { register } from './main/messenger.js';
import options from './common/options.js';

import { rootDir } from './main/main-constants.js';

export default new Promise((resolve, _reject) => {
    if (app) {
        app.whenReady()
            .then(() => {
                console.info('App is ready');
                const { width, height } = screen.getPrimaryDisplay().workAreaSize;

                const mainWindow = new BrowserWindow({
                    width: Math.min(1024, Math.floor(parseInt('' + width) * 0.8)),
                    height: Math.min(800, Math.floor(parseInt('' + height) * 0.8)),
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false
                    }
                });

                if (options.debug) {
                    mainWindow.webContents.openDevTools();
                }

                console.info('waiting for dom ready');
                mainWindow.loadFile(path.join(rootDir, 'src/renderer/index.html'))
                    .then(() => {
                        register((data) => {
                            BrowserWindow.getAllWindows().forEach(b => b.webContents.send(CHANNEL_MAIN, data));
                        });
                        resolve();
                    });

                // Close (exit) when all windows are closed
                app.on('window-all-closed', function () {
                    if (!options.headless) {
                        app.quit();
                    }
                });
            });
    } else {
        console.info('No app found, not launching gui');
        resolve();
    }
});
