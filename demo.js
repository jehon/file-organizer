
const options = require('./file-organizer/options.js');
const { notify } = require('./file-organizer/messenger.js');
const constants = require('./file-organizer/constants.js');

async function wait(secs) {
    return new Promise((resolve) => setTimeout(() => resolve(), secs * 1000));
}

options.headless = false;

require('./file-organizer/gui.js');

const history = new Map();

function withHistory(data) {
    if (history.has(data.id)) {
        const old = history.get(data.id);
        data = { ...old, ...data };
    }
    history.set(data.id, data);
    notify(data);
}

(async function () {
    withHistory({ id: 1001, status: constants.TASK_CREATED, title: 'task is created...' }); // final
    withHistory({ id: 1002, status: constants.TASK_CREATED, title: 'task is skipped...' });
    withHistory({ id: 1003, status: constants.TASK_CREATED, title: 'task is started...' });
    withHistory({ id: 1004, status: constants.TASK_CREATED, title: 'task is success' });
    withHistory({ id: 1005, status: constants.TASK_CREATED, title: 'task is failure' });

    await wait(1);
    withHistory({ id: 1002, status: constants.TASK_SKIPPED }); // final
    withHistory({ id: 1003, status: constants.TASK_STARTED }); // final
    withHistory({ id: 1004, status: constants.TASK_STARTED });
    withHistory({ id: 1005, status: constants.TASK_STARTED });

    await wait(1);
    withHistory({ id: 1004, status: constants.TASK_SUCCESS, messages: 'yahoo', details: 'it\'s done' }); // final
    withHistory({ id: 1005, status: constants.TASK_FAILURE, messages: 'Houston, we have had a problem', details: 'An explosion' }); // final
})();
