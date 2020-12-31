
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS,
    STATUS_FAILURE,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} from '../common/constants.js';
import XElement from './x-element.js';

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

export default class XList extends XElement {
    static get observedAttributes() {
        return ['x-parent'];
    }

    /** @type {HTMLElement} */
    #elListing = null

    /** @type {HTMLElement} */
    #elCounters = null

    _counters = {}
    _history = {}
    _total = 0;

    constructor() {
        super();

        this.innerHTML = `
<div class='counters'>
    <div>
        Created: <span x-counter='${STATUS_CREATED}'>0</span>
        Analysing: <span x-counter='${STATUS_ANALYSING}'>0</span>
        Success: <span x-counter='${STATUS_SUCCESS}'>0</span>
        Failure: <span x-counter='${STATUS_FAILURE}'>0</span>
    </div>
    <div>
        Need action: <span x-counter='${STATUS_NEED_ACTION}'>0</span>
        Acting: <span x-counter='${STATUS_ACTING}'>0</span>
        Action success: <span x-counter='${STATUS_ACTED_SUCCESS}'>0</span>
        Action failure: <span x-counter='${STATUS_ACTED_FAILURE}'>0</span>
    </div>
</div>
<div id='listing'></div>
`;

        this.#elListing = this.querySelector('#listing');
        this.#elCounters = this.querySelector('div.counters');
    }

    /**
     * @override
     */
    listenerFilter(item) {
        if (this.parentId <= 0) {
            // Mode: top only
            if (!item.isTop) {
                // Don't take it
                return false;
            }
        } else {
            // Mode: from parent
            if (this.parentId != item.parentId) {
                // Don't take it
                return false;
            }
        }
        return true;
    }

    /**
     * @override
     */
    drawItem(item) {
        // Initialize this counter
        if (!(item.status in this._counters)) {
            this._counters[item.status] = 0;
        }

        // We update the counter change
        if (item.id in this._history) {
            // We had that value before...
            const oldStatus = this._history[item.id].status;
            this._counters[oldStatus]--;
            this.#elCounters.querySelectorAll(`[x-counter="${oldStatus}"]`).forEach(el => el.innerHTML = '' + this._counters[oldStatus]);
        } else {
            this.#elListing.insertAdjacentHTML('beforeend', this.getChildElement(item));
            this._total++;
        }

        // We update
        this._history[item.id] = item;
        this._counters[item.status]++;
        this.#elCounters.querySelectorAll(`[x-counter="${item.status}"]`).forEach(el => el.innerHTML = '' + this._counters[item.status]);

        // We update the total
        this.#elCounters.querySelectorAll('progress[x-counter="total"]').forEach(e => {
            const p = uz(this._counters[STATUS_ACTED_SUCCESS])
                + uz(this._counters[STATUS_ACTED_FAILURE])
                + uz(this._counters[STATUS_SUCCESS])
                + uz(this._counters[STATUS_FAILURE]);

            e.setAttribute('max', '' + Math.max(1, this._total));
            e.setAttribute('value', '' + p);
        });
    }

    /**
     * Get the child item
     *
     * @abstract
     *
     * @param {number} _id of the item
     * @returns {string} the created node
     */
    getChildElement(_id) {
        return '';
    }
}

window.customElements.define('x-list', XList);
