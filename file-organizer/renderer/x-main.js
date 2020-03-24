
const listener = require('./listener.js');
const constants = require('../constants.js');

const tasksElement = document.querySelector('#tasks');

let tasks = {
    created: 0,
    skipped: 0,
    started: 0,
    success: 0,
    failure: 0
}

listener('main', (type, data) => {
    switch (type) {
        case constants.TASK_CREATED:
            tasksElement.insertAdjacentHTML('beforeend', `<x-task id="${data.id}"></x-task>`);
            tasks.created++;
            break;
        case constants.TASK_SKIPPED:
            tasks.skipped++;
            break;
        case constants.TASK_STARTED:
            tasks.started++;
            break;
        case constants.TASK_SUCCESS:
            tasks.success++;
            break;
        case constants.TASK_FAILURE:
            tasks.failure++;
            break;
    }
});
