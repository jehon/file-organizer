
import { listenerForId } from './listener.js';
import { STATUS_CREATED } from '../common/constants.js';

export default class XItem extends HTMLElement {
    static get observedAttributes() {
        return ['id'];
    }

    #stopListener = () => { }

    constructor() {
        super();
        this.status = STATUS_CREATED;
        this.data = {};
    }

    attributeChangedCallback(attributeName, _oldValue, newValue) {
        switch (attributeName) {
            case 'id':
                if (!newValue) {
                    return;
                }
                this._id = newValue;

                this.#stopListener();
                this.#stopListener = listenerForId(this._id, (status, data) => {
                    this.status = status;
                    this.data = { ...this.data, ...data };
                    if (data) {
                        this.adapt(data);
                    }
                });
                break;
        }
    }

    connectectCallback() {
        if (this.hasAttribute('id')) {
            this.attributeChangedCallback('id', null, this.getAttribute('id'));
        }
    }

    disconnectedCallback() {
        this.#stopListener();
        this.#stopListener = () => { };
    }

    adapt(data) {
        this.setAttribute('status', this.status);
        this.innerHTML = `<div>
            <h3><x-status status='${data.status}'></x-status>${data.title ? data.title : data.id}</h3>
            <div class='details'></div>
        </div > `;

        // <div class='messages'>${data.messages ? data.messages : ''}</div>
        // <div class='details' >${data.details ? data.details : ''}</div>
    }
}

window.customElements.define('x-item', XItem);
