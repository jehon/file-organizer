
require('./x-task.js');

const { listener } = require('./listener.js');
const constants = require('../constants.js');

class XTasksList extends HTMLElement {
    // static get observedAttributes() {
    //     return ['id'];
    // }

    constructor() {
        super();
        this.data = {};

        this.createdCount = 0;
        this.skippedCount = 0;
        this.startedCount = 0;
        this.successCount = 0;
        this.failureCount = 0;

        this.innerHTML = `
            <div>
                Created: <span id='created'>0</span>
                Skipped: <span id='skipped'>0</span>
                Started: <span id='started'>0</span>
                Success: <span id='success'>0</span>
                Failure: <span id='failure'>0</span>
            </div>
            <div id='tasks'></div>
        `;
        this.tasksElement = this.querySelector('#tasks');
        this.createdElement = this.querySelector('#created');
        this.skippedElement = this.querySelector('#skipped');
        this.startedElement = this.querySelector('#started');
        this.successElement = this.querySelector('#success');
        this.failureElement = this.querySelector('#failure');

        listener((id, type, _data) => {
            switch (type) {
                case constants.TASK_CREATED:
                    this.tasksElement.insertAdjacentHTML('beforeend', `<x-task id="${id}"></x-task>`);
                    this.createdCount++;
                    this.createdElement.innerHTML = '' + this.createdCount;
                    break;
                case constants.TASK_SKIPPED:
                    this.skippedCount++;
                    this.skippedElement.innerHTML = '' + this.skippedCount;
                    break;
                case constants.TASK_STARTED:
                    this.startedCount++;
                    this.startedElement.innerHTML = '' + this.startedCount;
                    break;
                case constants.TASK_SUCCESS:
                    this.successCount++;
                    this.successElement.innerHTML = '' + this.successCount;
                    break;
                case constants.TASK_FAILURE:
                    this.failureCount++;
                    this.failureElement.innerHTML = '' + this.failureCount;
                    break;
            }
        });

    }
}

window.customElements.define('x-taskslist', XTasksList);
