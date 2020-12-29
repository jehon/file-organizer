
import {
    STATUS_CREATED,
    STATUS_ACTING,
    STATUS_ANALYSING,
    STATUS_NEED_ACTION
} from '../common/constants.js';

import '../../node_modules/css-inherit/css-inherit.js';

export default class XStatus extends HTMLElement {
    static get observedAttributes() {
        return ['status'];
    }

    constructor() {
        super();
        this.status = STATUS_CREATED;
        this.innerHTML = `
<span class='${this.status}'>
    <img class='icon' src="" title="${this.status}">
</span>`;
        this.eImg = this.querySelector('img');
    }

    attributeChangedCallback(attributeName, _oldValue, newValue) {
        switch (attributeName) {
            case 'status':
                if (newValue) {
                    this.status = newValue;
                }
                this.adapt();
        }
    }

    adapt() {
        let ext = '.png';
        switch (this.status) {
            case STATUS_ANALYSING:
            case STATUS_ACTING:
                ext = '.gif';
                break;

            case STATUS_NEED_ACTION:
                ext = '.svg';
                break;
        }
        this.eImg.setAttribute('src', `img/${this.status}${ext}`);
    }
}

window.customElements.define('x-status', XStatus);
