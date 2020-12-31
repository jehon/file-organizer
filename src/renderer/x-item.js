
import XElement from './x-element.js';
import './x-icon.js';
import './x-value.js';
import { STATUS_CREATED } from '../common/constants.js';

export default class XItem extends XElement {
    static get observedAttributes() {
        return ['x-id'];
    }

    /** @type {HTMLElement} */
    elHeader = null

    /** @type {HTMLElement} */
    elIcon = null

    /** @type {HTMLElement} */
    elTitle = null

    /** @type {HTMLElement} */
    elStatus = null

    /** @type {HTMLElement} */
    elProblems = null

    /** @type {HTMLElement} */
    elValues = null

    constructor() {
        super();
        this.innerHTML = `
    <h3 class='${STATUS_CREATED}'>
        <x-icon value='${STATUS_CREATED}'></x-icon>
        <span id='title'></span>
    </h3>
    <div id='problems' class='problems'></div>
    <div id='values' class='values'></div>
`;

        this.elHeader = this.querySelector('h3');
        this.elIcon = this.querySelector('h3 > x-icon');
        this.elTitle = this.querySelector('h3 > #title');

        this.elProblems = this.querySelector('#problems');
        this.elValues = this.querySelector('#values');
    }

    listenerFilter(item) {
        return item.id == this.itemId;
    }

    drawItem(item) {
        this.elHeader.setAttribute('status', item.status);

        this.elTitle.innerHTML = item.title;
        this.elTitle.setAttribute('data-tooltip', item.id);
        this.elIcon.setAttribute('value', item.status);

        if (this.elListing) {
            this.elListing.remove();
        }
        this.elListing = this.getListingElement(item);
        this.elListing.id = 'listing';
        this.insertAdjacentElement('beforeend', this.elListing);

        this.elValues.innerHTML = '';
        if (item.values) {
            for (const p of Object.keys(item.values)) {
                this.elValues.insertAdjacentHTML('beforeend',
                    `<x-value x-id='${item.id}' x-value='${p}' >${item.id} ${p}</x-value>`
                );
            }
        }

        this.elProblems.innerHTML = '';
        if (item.problemsList) {
            for (const p of item.problemsList) {
                this.elProblems.insertAdjacentHTML('beforeend',
                    `<div class='problem'><x-icon value='problem'></x-icon>${p}</div>`
                );
            }
        }

        return true;
    }

    /**
     * @abstract
     *
     * @param {HTMLElement} _item basis of children
     */
    getListingElement(_item) {
        return null;
    }
}

window.customElements.define('x-item', XItem);
