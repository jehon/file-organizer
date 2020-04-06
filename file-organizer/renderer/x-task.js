
const { listenerForId } = require('./listener.js');

require('./x-status.js');

const {
    STATUS_CREATED
} = require('../constants.js');

class XTask extends HTMLElement {
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
                this.adapt();
            });
            this.adapt();
        }
    }

    adapt() {
        this.setAttribute('status', this.status);
        this.innerHTML = `<div>
            <h3><x-status status='${this.status}'></x-status>Task ${this.data ? this.data.title : this.id}</h3>
            <div class='messages'>${this.data.messages ? this.data.messages : ''}</div>
            <div class='details' >${this.data.details ? this.data.details : ''}</div>
        </div>`;
    }
}

window.customElements.define('x-task', XTask);
