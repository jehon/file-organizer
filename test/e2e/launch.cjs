
const { app, BrowserWindow } = require('electron');
const assert = require('assert').strict;

// console.log(process.argv);
// Override the args
process.argv = [process.argv[0], process.argv[1], '-n', 'tests/data'];

require('../../src/main.cjs');

const ms = async (i) => new Promise((resolve) => setTimeout(resolve, i));

const waitFor = async function (msg, test) {
    for (let i = 0; i < 10; i++) {
        const val = test();
        if (val) {
            console.info(msg, ': ok');
            return;
        }
        await ms(200);
    }
    throw msg + ': failed';
};

const waitForEvent = async function (event, object, timeout = 2000) {
    return new Promise((resolve, reject) => {
        const stop = setTimeout(() => {
            reject('Waiting for event ' + event + ': timeout');
        }, timeout);

        object.once(event, () => {
            console.info('Received ' + event + ': ok');
            clearTimeout(stop);
            resolve();
        });
    });
};

app.whenReady().then(async () => {
    assert.equal(app.isReady(), true);

    await waitFor('Wait for the first window', () => BrowserWindow.getAllWindows().length > 0);
    const win = BrowserWindow.getAllWindows()[0];

    await waitFor('Wait for the window to be visible', () => win.isVisible());
    await waitForEvent('did-finish-load', win.webContents, 10 * 1000);

    assert.equal(
        await win.webContents.executeJavaScript('document.querySelector("h1").innerText'),
        'File Organizer'
    );

    // TODO: test a javascript rendered element to see if it did really load with all features

    console.info('Test done');
}).catch(e => {
    console.error('Test failed: ', e);
    process.exit(1);
}).finally(() => app.quit());
