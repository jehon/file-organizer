
const listener = require('./listener.js');

class XTask extends HTMLElement {
    static get observedAttributes() {
        return ['id'];
    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        this.id = newValue;
        listener(this.id, (data) => {
            console.log('task ', this.id, data);
            adapt();
        })
        adapt();
    }

    adapt() {
        this.innerHTML = `<div>
            <h3>Task ${this.id}</h3>
        </div>`
    }
}

window.customElements.define('x-task', XTask);
