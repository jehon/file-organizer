
import './x-file.js';

import XList from './x-list.js';

import {
    TYPE_FILE,
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS,
    STATUS_FAILURE,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} from '../common/constants.js';

export default class XFilesList extends XList {
    get refType() {
        return TYPE_FILE;
    }

    constructor() {
        super();

        this.innerHTML = `
            <h2>Files</h2>
            <div>
                <div>
                    Created: <span counter='${STATUS_CREATED}'>0</span>
                    Analysing: <span counter='${STATUS_ANALYSING}'>0</span>
                    Success: <span counter='${STATUS_SUCCESS}'>0</span>
                    Failure: <span counter='${STATUS_FAILURE}'>0</span>
                </div>
                <div>
                    Need action: <span counter='${STATUS_NEED_ACTION}'>0</span>
                    Acting: <span counter='${STATUS_ACTING}'>0</span>
                    Action success: <span counter='${STATUS_ACTED_SUCCESS}'>0</span>
                    Action failure: <span counter='${STATUS_ACTED_FAILURE}'>0</span>
                </div>
            </div>
            <div id='listing'></div>
        `;
        this.createdElements = this.querySelector('#listing');
    }

    onCreate(id) {
        // console.log('+', id);
        super.onCreate(id);
        this.createdElements.insertAdjacentHTML('beforeend', `<x-file id="${id}"></x-file>`);
    }
}

window.customElements.define('x-files-list', XFilesList);
