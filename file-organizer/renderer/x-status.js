
const {
    STATUS_CREATED,
    STATUS_ACTING,
    STATUS_ANALYSING,
    STATUS_NEED_ACTION
} = require('../constants.js');

require('../../node_modules/css-inherit/css-inherit.js');

class XStatus extends HTMLElement {
    static get observedAttributes() {
        return ['status'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.status = STATUS_CREATED;
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        if (newValue) {
            this.status = newValue;
        }
        this.adapt();
    }

    adapt() {
        let img = '';
        switch (this.status) {
            case STATUS_ANALYSING:
            case STATUS_ACTING:
                img = this.status + '.gif';
                break;

            case STATUS_NEED_ACTION:
                img = this.status + '.svg';
                break;
            default:
                img = this.status + '.png';
        }

        this.shadowRoot.innerHTML = `
        <css-inherit></css-inherit>
        <span class='${this.status}'>
            <img class='icon' src="img/${img}" title="${this.status}">${this.data ? this.data.title : this.id}
        </span>`;
    }
}

window.customElements.define('x-status', XStatus);
