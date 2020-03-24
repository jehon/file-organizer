
const listener = require('./listener.js');

class XTask extends HTMLElement {
    static get observedAttributes() {
        return ['id'];
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        this._id = newValue;
        if (this._id) {
            listener(this._id, (type, data) => {
                console.log('task ', this._id, type, data);
                this.status = type;
                this.data = { ...this.data, ...data };
                this.adapt();
            })
            this.adapt();
        }
    }

    adapt() {
        this.setAttribute('status', this.status);
        this.innerHTML = `<div>
            <h3>Task ${this.id}</h3>
            ${JSON.stringify(this.data)}
        </div>`
    }
}

window.customElements.define('x-task', XTask);
