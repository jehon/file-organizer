
const listener = require('./listener.js');
const constants = require('../constants.js');

const tasksElement = document.querySelector('#tasks');

listener('main', (type, data) => {
    switch (type) {
        case constants.TASK_CREATED:
            tasksElement.insertAdjacentHTML('beforeend', `<x-task id="${data.id}"></x-task>`);
            break;
    }
});
