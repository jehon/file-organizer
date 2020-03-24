
const options = require('./file-organizer/options.js');
const { notify } = require('./file-organizer/messenger.js');
const constants = require('./file-organizer/constants.js');

async function wait(secs) {
    return new Promise((resolve) => setTimeout(() => resolve(), secs * 1000));
}

options.headless = false;

require('./file-organizer/gui.js');

(async function () {
    notify('hello world', {});

    notify('main', { type: constants.TASK_CREATED, id: 1001 });
    notify('main', { type: constants.TASK_CREATED, id: 1002 });
    notify('main', { type: constants.TASK_CREATED, id: 1003 });
    notify('main', { type: constants.TASK_CREATED, id: 1004 });
    notify('main', { type: constants.TASK_CREATED, id: 1005 });

    notify(1001, { type: constants.TASK_CREATED, title: 'task is created...' }); // final
    notify(1002, { type: constants.TASK_CREATED, title: 'task is skipped...' });
    notify(1003, { type: constants.TASK_CREATED, title: 'task is started...' });
    notify(1004, { type: constants.TASK_CREATED, title: 'task is success' });
    notify(1005, { type: constants.TASK_CREATED, title: 'task is failure' });

    wait(1);
    notify(1002, { type: constants.TASK_SKIPPED }); // final
    notify(1003, { type: constants.TASK_STARTED }); // final
    notify(1004, { type: constants.TASK_STARTED });
    notify(1005, { type: constants.TASK_STARTED });

    wait(1);
    notify(1004, { type: constants.TASK_SUCCESS, messages: 'yahoo', details: 'it\'s done' }); // final
    notify(1005, { type: constants.TASK_FAILURE, messages: 'Houston, we have had a problem', details: 'An explosion' }); // final

})();
