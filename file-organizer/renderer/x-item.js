
const { listenerForId } = require('./listener.js');
const { STATUS_CREATED } = require('../constants.js');

class XItem extends HTMLElement {
    static get observedAttributes() {
        return ['id'];
    }

    constructor() {
        super();
        this.status = STATUS_CREATED;
        this.data = {};
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        if (!newValue) {
            return;
        }
        this._id = newValue;
        if (this._id) {
            listenerForId(this._id, (status, data) => {
                this.status = status;
                this.data = { ...this.data, ...data };
                if (data) {
                    this.adapt(data);
                }
            });
        }
    }

    adapt(data) {
        this.setAttribute('status', this.status);
        this.innerHTML = `<div>
            <h3><x-status status='${data.status}'></x-status>Task ${data.title ? data.title : data.id}</h3>
            <div class='messages'>${data.messages ? data.messages : ''}</div>
            <div class='details' >${data.details ? data.details : ''}</div>
        </div > `;
    }
}

window.customElements.define('x-item', XItem);

module.exports = XItem;
