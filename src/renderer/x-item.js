
import XElement from './x-element.js';
import {
    STATUS_CREATED,
    STATUS_ACTING,
    STATUS_ANALYSING,
    STATUS_NEED_ACTION
} from '../common/constants.js';


export default class XItem extends XElement {
    static get observedAttributes() {
        return ['x-id'];
    }

    /** @type {HTMLElement} */
    elImg = null

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
        <img class='icon' src="">
        <span id='title'></span>
    </h3>
    <div class='details' id='details'></div>
    <div id='listing'></div>
`;

        this.elImg = this.querySelector('h3 > img');
        this.elTitle = this.querySelector('h3 > #title');

        this.elDetails = this.querySelector('#details');
        this.elListing = this.querySelector('#listing');
    }

    listenerFilter(item) {
        return item.id == this.itemId;
    }

    drawItem(item) {
        this.setAttribute('status', item.status);

        this.elTitle.innerHTML = item.id + ' ' + item.title;
        let ext = '.png';
        switch (item.status) {
            case STATUS_ANALYSING:
            case STATUS_ACTING:
                ext = '.gif';
                break;

            case STATUS_NEED_ACTION:
                ext = '.svg';
                break;
        }
        this.elImg.setAttribute('src', `img/${item.status}${ext}`);

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
