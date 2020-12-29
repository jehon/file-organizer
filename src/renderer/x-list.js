
import { listener } from './listener.js';

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
 * Send back the def if val is undefined
 * TODO: use ??
 *
 * @param {number|undefined|null} val to be tested
 * @param {number} def the default value
 * @returns {number} the value
 */
function uz(val, def = 0) {
    if (val === undefined || val === null) {
        return def;
    }
    return val;
}

export default class XList extends HTMLElement {
    static get observedAttributes() {
        return ['top', 'parent'];
    }

    #isTop = false;
    #parentId = '';

    #stopListener = () => { }
    #counters = {}
    #history = {}
    #total = 0;

    get refType() {
        return '';
    }

    attributeChangedCallback(attributeName, _oldValue, newValue) {
        switch (attributeName) {
            case 'parent':
                this.#parentId = newValue;
                this.reset();
                break;
            case 'top':
                this.#isTop = this.hasAttribute('top');
                this.reset();
                break;
        }
    }

    connectedCallback() {
        this.reset();
    }

    disconnectedCallback() {
        this.#stopListener();
        this.#stopListener = () => { };
    }

    reset() {
        if (!this.refType || (!this.#parentId && !this.#isTop)) {
            return;
        }

        this.#stopListener();
        this.#stopListener = listener((data) => {

            if (this.refType != data.type) {
                // Don't take it
                return;
            }

            if ((this.#isTop && !data.isTop) || (!this.#isTop && data.isTop)) {
                // Don't take it
                return;
            }

            if (!this.#isTop && (this.#parentId != data.parentId)) {
                // Don't take it
                return;
            }

            if (!(status in this.#counters)) {
                this.#counters[status] = 0;
            }

            if (data.id in this.#history) {
                // We had that value before...
                const oldStatus = this.#history[data.id].status;
                this.#counters[oldStatus]--;
                this.updateCounter(oldStatus);
            } else {
                this.onCreate(data.id);
                this.#total++;
            }

            // We update
            this.#history[data.id] = data;
            this.#counters[status]++;

            this.updateCounter(status);
        });

    }

    updateCounter(status) {
        this.querySelectorAll(`[counter=${status}]`).forEach(
            el => el.innerHTML = '' + this.#counters[status]
        );

        this.querySelectorAll('progress[category=total]').forEach(e => {
            const p = uz(this.#counters[STATUS_ACTED_SUCCESS])
                + uz(this.#counters[STATUS_ACTED_FAILURE])
                + uz(this.#counters[STATUS_SUCCESS])
                + uz(this.#counters[STATUS_FAILURE]);

            e.setAttribute('max', '' + Math.max(1, this.#total));
            e.setAttribute('value', '' + p);
        });
    }

    onCreate(_id) { }
}

window.customElements.define('x-list', XList);
