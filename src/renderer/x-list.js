
import { listenerForType } from './listener.js';

import {
    // STATUS_CREATED,
    // STATUS_ANALYSING,
    STATUS_SUCCESS,
    STATUS_FAILURE,
    // STATUS_NEED_ACTION,
    // STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} from '../common/constants.js';

/**
 * @param val
 * @param def
 */
function uz(val, def = 0) {
    if (val === undefined || val === null) {
        return def;
    }
    return val;
}

export default class XList extends HTMLElement {
    constructor(refType) {
        super();
        this.parent_id = 0;
        this.counters = {};
        this.history = {};
        this.refType = refType;
        this.total = 0;
    }

    static get observedAttributes() {
        return ['parent'];
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        switch (attributeName) {
            case 'parent':
                this.parent_id = newValue;
                break;
        }
    }

    connectedCallback() {
        this.off = listenerForType(this.refType, (id, status, data) => {
            if (!this.filter(id, status, data)) {
                return;
            }
            if (!(status in this.counters)) {
                this.counters[status] = 0;
            }

            if (id in this.history) {
                // We had that value before...
                const oldStatus = this.history[id].status;
                this.counters[oldStatus]--;
                this.updateCounter(oldStatus);
            } else {
                this.onCreate(id, status, data);
                this.total++;
            }

            // We update
            this.history[id] = data;
            this.counters[status]++;

            this.updateCounter(status);
        });
    }

    disconnectedCallback() {
        if (this.off) {
            this.off();
        }
        this.off = null;
    }

    updateCounter(status) {
        this.querySelectorAll(`[counter=${status}]`).forEach(
            el => el.innerHTML = '' + this.counters[status]
        );

        this.querySelectorAll('progress[category=total]').forEach(e => {
            const p = uz(this.counters[STATUS_ACTED_SUCCESS])
                + uz(this.counters[STATUS_ACTED_FAILURE])
                + uz(this.counters[STATUS_SUCCESS])
                + uz(this.counters[STATUS_FAILURE]);

            e.setAttribute('max', Math.max(1, this.total));
            e.setAttribute('value', p);
        });
    }

    filter(_id, _status, data) {
        if (this.parent_id > 0) {
            return data.parent == this.parent_id;
        }
        return true;
    }

    onCreate(_id) { }
}

window.customElements.define('x-list', XList);
