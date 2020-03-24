
const listener = require('./listener.js');

class XTask extends HTMLElement {
    static get observedAttributes() {
        return ['id'];
    }

    constructor() {
        super();
        this.status = "created";
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        this._id = newValue;
        if (this._id) {
            listener(this._id, (type, data) => {
                this.status = type.replace('task_', '');
                this.data = { ...this.data, ...data };
                this.adapt();
            });
            this.adapt();
        }
    }

    adapt() {
        this.setAttribute('status', this.status);
        this.innerHTML = `<div>
            <h3><img class='icon' src="img/${this.status}.png">Task ${this.id}</h3>
            ${JSON.stringify(this.data)}
        </div>`;
    }
}

window.customElements.define('x-task', XTask);
