
const { listenerFor } = require('./listener.js');

class XTask extends HTMLElement {
    static get observedAttributes() {
        return ['id'];
    }

    constructor() {
        super();
        this.status = 'created';
        this.data = {};
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        this._id = newValue;
        if (this._id) {
            listenerFor(this._id, (type, data) => {
                this.status = type.replace('task_', '');
                this.data = { ...this.data, ...data };
                this.adapt();
            });
            this.adapt();
        }
    }

    adapt() {
        console.log(this.id, this.data);
        this.setAttribute('status', this.status);
        this.innerHTML = `<div>
            <h3><img class='icon' src="img/${this.status}.png">Task ${this.data ? this.data.title : this.id}</h3>
            <div class='messages'>${this.data.messages ? this.data.messages : ''}</div>
            <div class='details' >${this.data.details ? this.data.details : ''}</div>
        </div>`;
    }
}

window.customElements.define('x-task', XTask);
