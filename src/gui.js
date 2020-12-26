
import path from 'path';

import { CHANNEL_MAIN } from './common/constants.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Modules to control application life and create native browser window
const { app, BrowserWindow, screen } = require('electron');


import { registerGuiCallback } from './main/messenger.js';
import options from './common/options.js';

import { rootDir } from './main/main-constants.js';

/**
 * @returns {boolean} if available
 */
export function guiAvailable() {
    return !!app;
}

/**
 * @returns {Promise} resolve when started
 */
export async function guiStart() {
    if (!guiAvailable()) {
        console.info('No app found, not launching gui');
        return;
    }

    // Remove warning: https://github.com/electron/electron/issues/18397
    app.allowRendererProcessReuse = true;

    await app.whenReady();

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
    await mainWindow.loadFile(path.join(rootDir, 'src/renderer/index.html'));
    registerGuiCallback((data) => {
        BrowserWindow.getAllWindows().forEach(b => b.webContents.send(CHANNEL_MAIN, data));
    });

    // Close (exit) when all windows are closed
    app.on('window-all-closed', function () {
        app.quit();
    });
}
