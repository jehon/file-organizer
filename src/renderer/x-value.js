
import XElement from './x-element.js';

export default class XValue extends XElement {
    static get observedAttributes() {
        return ['x-id', 'x-value'];
    }

    listenerFilter(item) {
        return item.id == this.itemId;
    }

    drawItem(item) {
        const val = this.getAttribute('x-value');
        this.innerHTML = 'item ' + item.id + ' # ' + val;
    }
}

customElements.define('x-value', XValue);
