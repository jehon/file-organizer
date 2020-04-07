
const options = require('./file-organizer/options.js');
const { notify } = require('./file-organizer/main/messenger.js');
const {
    TYPE_TASK,
    STATUS_CREATED,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('./file-organizer/constants.js');

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
    withHistory({ id: 1001, status: STATUS_CREATED, type: TYPE_TASK, title: 'task is created...' }); // final
    withHistory({ id: 1003, status: STATUS_CREATED, type: TYPE_TASK, title: 'task is started...' });
    withHistory({ id: 1004, status: STATUS_CREATED, type: TYPE_TASK, title: 'task is success' });
    withHistory({ id: 1005, status: STATUS_CREATED, type: TYPE_TASK, title: 'task is failure' });

    await wait(2);
    withHistory({ id: 1003, status: STATUS_ACTING }); // final
    withHistory({ id: 1004, status: STATUS_ACTING });
    withHistory({ id: 1005, status: STATUS_ACTING });

    await wait(2);
    withHistory({ id: 1004, status: STATUS_ACTED_SUCCESS, messages: 'yahoo', details: 'it\'s done' }); // final
    withHistory({ id: 1005, status: STATUS_ACTED_FAILURE, messages: 'Houston, we have had a problem', details: 'An explosion' }); // final
})();
