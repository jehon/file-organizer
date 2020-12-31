
import {
    // STATUS_CREATED,
    STATUS_ANALYSING,
    // STATUS_SUCCESS,
    // STATUS_FAILURE,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    // STATUS_ACTED_SUCCESS,
    // STATUS_ACTED_FAILURE
} from '../common/constants.js';

export default class XIcon extends HTMLElement {
    static get observedAttributes() {
        return ['value'];
    }

    /** @type {HTMLElement} */
    #elImg = null

    constructor() {
        super();
        this.innerHTML = '<img style="height: 100%; vertical-align: middle; display: inline-block"/>';
        this.#elImg = this.querySelector('img');
    }

    /**
     * @override
     */
    attributeChangedCallback(_attributeName, _oldValue, _newValue) {
        this.render();
    }

    render() {
        const status = this.getAttribute('value');
        let ext = 'png';
        switch (status) {
            case STATUS_ANALYSING:
            case STATUS_ACTING:
                ext = 'gif';
                break;

            case STATUS_NEED_ACTION:
            case 'total':
                ext = 'svg';
                break;
        }

        this.#elImg.setAttribute('src', `img/${status}.${ext}`);
        this.setAttribute('data-tooltip', status);
    }
}

customElements.define('x-icon', XIcon);
