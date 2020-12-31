
import XElement from './x-element.js';
import './x-icon.js';
import { STATUS_CREATED } from '../common/constants.js';

export default class XItem extends XElement {
    static get observedAttributes() {
        return ['x-id'];
    }

    /** @type {HTMLElement} */
    elIcon = null

    /** @type {HTMLElement} */
    elTitle = null

    /** @type {HTMLElement} */
    elListing = null

    /** @type {HTMLElement} */
    elStatus = null

    /** @type {HTMLElement} */
    elDtails = null

    constructor() {
        super();
        this.innerHTML = `
    <h3 class='${STATUS_CREATED}'>
        <x-icon value='${STATUS_CREATED}'></x-icon>
        <span id='title'></span>
    </h3>
    <div class='details' id='details'></div>
    <div id='listing'></div>
`;

        this.elIcon = this.querySelector('h3 > x-icon');
        this.elTitle = this.querySelector('h3 > #title');

        this.elDetails = this.querySelector('#details');
        this.elListing = this.querySelector('#listing');
    }

    listenerFilter(item) {
        return item.id == this.itemId;
    }

    drawItem(item) {
        this.setAttribute('status', item.status);

        this.elTitle.innerHTML = item.title;
        this.elTitle.setAttribute('data-tooltip', item.id);
        this.elIcon.setAttribute('value', item.status);

        this.elListing.innerHTML = this.getListingElement(item);

        return true;
    }

    /**
     * @abstract
     *
     * @param {module:src/renderer/Item} _item basis of children
     */
    getListingElement(_item) {
        return '';
    }
}

window.customElements.define('x-item', XItem);
