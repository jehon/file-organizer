
import { listener } from './listener.js';

/**
 * @typedef {object} Item
 * @property {number} id of the data
 * @property {string} type of the data
 * @property {number} parentId of the data
 */

export default class XElement extends HTMLElement {
    #stopListener = () => { }

    /** @type {number} */
    #itemId = 0

    /** @type {number} */
    #parentId = 0

    constructor() {
        super();
        this.innerHTML = 'Loading...';
    }

    get itemId() {
        return this.#itemId;
    }

    get parentId() {
        return this.#parentId;
    }

    connectedCallback() {
        this.reset();
    }

    disconnectedCallback() {
        this.#stopListener();
        this.#stopListener = () => { };
    }

    /**
     * This behavior will be adapted by 'observedAttributes
     *
     * @param {string} attributeName changed
     * @param {string} _oldValue of the attribute
     * @param {string} newValue of the attribute
     */
    attributeChangedCallback(attributeName, _oldValue, newValue) {
        switch (attributeName) {
            case 'x-parent':
                this.#parentId = parseInt(newValue);
                this.reset();
                break;
            case 'x-id':
                if (!newValue) {
                    return;
                }
                {
                    const newId = Number.parseInt(newValue);
                    if (Number.isFinite(newId)) {
                        this.#itemId = newId;
                        this.reset();
                    }
                }
                break;
        }
    }

    reset() {
        this.#stopListener();
        // We restart the listening to receive the history
        this.#stopListener = listener((item) => {
            if (this.listenerFilter(item)) {
                this.drawItem(item);
            }
            return item;
        });
    }

    /*
        For sub classes
     */

    /**
     * Filter incoming listening
     *
     * @abstract
     *
     * @param {Item} _item to be tested
     * @returns {boolean} true if the data is valid
     */
    listenerFilter(_item) {
        return true;
    }

    /**
     * @abstract
     *
     * @param {Item} _item to be drawn
     * @returns {void}
     */
    drawItem(_item) { }

}

customElements.define('x-element', XElement);
