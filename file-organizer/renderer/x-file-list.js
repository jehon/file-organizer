
require('./x-task.js');

const { listenerForType } = require('./listener.js');

const {
    TYPE_FILE,
    STATUS_CREATED,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../constants.js');

class XFileList extends HTMLElement {
    constructor() {
        super();
        this.data = {};

        this.createdCount = 0;
        this.startedCount = 0;
        this.successCount = 0;
        this.failureCount = 0;

        this.innerHTML = `
            <div>
                Created: <span id='created'>0</span>
                Started: <span id='started'>0</span>
                Success: <span id='success'>0</span>
                Failure: <span id='failure'>0</span>
            </div>
            <div id='tasks'></div>
        `;
        this.tasksElement = this.querySelector('#tasks');
        this.createdElement = this.querySelector('#created');
        this.startedElement = this.querySelector('#started');
        this.successElement = this.querySelector('#success');
        this.failureElement = this.querySelector('#failure');

        listenerForType(TYPE_TASK, (id, status, _data) => {
            switch (status) {
                case STATUS_CREATED:
                    this.tasksElement.insertAdjacentHTML('beforeend', `<x-task id="${id}"></x-task>`);
                    this.createdCount++;
                    this.createdElement.innerHTML = '' + this.createdCount;
                    break;
                case STATUS_ACTING:
                    this.startedCount++;
                    this.startedElement.innerHTML = '' + this.startedCount;
                    break;
                case STATUS_ACTED_SUCCESS:
                    this.successCount++;
                    this.successElement.innerHTML = '' + this.successCount;
                    break;
                case STATUS_ACTED_FAILURE:
                    this.failureCount++;
                    this.failureElement.innerHTML = '' + this.failureCount;
                    break;
            }
        });

    }
}

window.customElements.define('x-taskslist', XTasksList);
