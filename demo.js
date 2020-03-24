
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
    notify(1001, { type: constants.TASK_CREATED });

    notify('main', { type: constants.TASK_CREATED, id: 1002 });
    notify(1002, { type: constants.TASK_CREATED });

    notify('main', { type: constants.TASK_CREATED, id: 1003 });
    notify(1003, { type: constants.TASK_CREATED });

    notify('main', { type: constants.TASK_CREATED, id: 1004 });
    notify(1004, { type: constants.TASK_CREATED });

    notify('main', { type: constants.TASK_CREATED, id: 1005 });
    notify(1005, { type: constants.TASK_CREATED });

    notify('main', { type: constants.TASK_CREATED, id: 1006 });
    notify(1006, { type: constants.TASK_CREATED });

    notify('main', { type: constants.TASK_CREATED, id: 1007 });
    notify(1007, { type: constants.TASK_CREATED });

    wait(1);
    notify(1002, { type: constants.TASK_SKIPPED });
    notify(1003, { type: constants.TASK_SKIPPED });
    notify(1004, { type: constants.TASK_STARTED });
    notify(1005, { type: constants.TASK_STARTED });
    notify(1006, { type: constants.TASK_STARTED });
    notify(1007, { type: constants.TASK_STARTED });

    wait(1);
    notify(1004, { type: constants.TASK_SUCCESS });
    notify(1005, { type: constants.TASK_SUCCESS });
    notify(1006, { type: constants.TASK_FAILURE });
    notify(1007, { type: constants.TASK_FAILURE });

})();
