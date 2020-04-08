
require('./x-task.js');

const XList = require('./x-list.js');

const {
    TYPE_TASK,
    STATUS_CREATED,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../constants.js');

class XTasksList extends XList {
    constructor() {
        super(TYPE_TASK);

        this.innerHTML = `
            <div>
                Created: <span counter='${STATUS_CREATED}'>0</span>
                Started: <span counter='${STATUS_ACTING}'>0</span>
                Success: <span counter='${STATUS_ACTED_SUCCESS}'>0</span>
                Failure: <span counter='${STATUS_ACTED_FAILURE}'>0</span>
            </div>
            <progress category='total' max=1 value=0></progress>
            <div id='created'></div>
        `;
        this.createdElements = this.querySelector('#created');
    }

    onCreate(id) {
        super.onCreate(id);
        this.createdElements.insertAdjacentHTML('beforeend', `<x-task id="${id}"></x-task>`);
    }
}

window.customElements.define('x-tasks-list', XTasksList);
