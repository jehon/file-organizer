
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
import './x-counter.js';

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
        this.style.display = 'none';

        this.innerHTML = `
<style>
.counters {
    height: 1em;
}
</style>
<div class='counters'>
    <x-counter x-icon='${STATUS_CREATED}'></x-counter>
    <x-counter x-icon='${STATUS_ANALYSING}'></x-counter>
    <x-counter x-icon='${STATUS_SUCCESS}'></x-counter>
    <x-counter x-icon='${STATUS_FAILURE}'></x-counter>
    (
    <x-counter x-icon='${STATUS_NEED_ACTION}'></x-counter>
    <x-counter x-icon='${STATUS_ACTING}'></x-counter>
    <x-counter x-icon='${STATUS_ACTED_SUCCESS}'></x-counter>
    <x-counter x-icon='${STATUS_ACTED_FAILURE}'></x-counter>
    )
    <x-counter x-icon='total'></x-counter>
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
            this.#elCounters.querySelectorAll(`[x-icon="${oldStatus}"]`).forEach(el => el.setAttribute('value', this._counters[oldStatus]));
        } else {
            this.#elListing.insertAdjacentHTML('beforeend', this.getChildElement(item));
            this._total++;
        }

        // We update
        this._history[item.id] = item;
        this._counters[item.status]++;
        this.#elCounters.querySelectorAll(`[x-icon="${item.status}"]`).forEach(el => el.setAttribute('value', this._counters[item.status]));

        // We update the total
        this.#elCounters.querySelectorAll('progress[x-counter="total"]').forEach(e => {
            const p = uz(this._counters[STATUS_ACTED_SUCCESS])
                + uz(this._counters[STATUS_ACTED_FAILURE])
                + uz(this._counters[STATUS_SUCCESS])
                + uz(this._counters[STATUS_FAILURE]);

            e.setAttribute('max', '' + Math.max(1, this._total));
            e.setAttribute('value', '' + p);
        });

        this.#elCounters.querySelectorAll('[x-icon="total"]').forEach(el => el.setAttribute('value', '' + this._total));

        if (this._total > 0) {
            this.style.display = 'initial';
        } else {
            this.style.display = 'none';
        }
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
