
import './x-status.js';
import XItem from './x-item.js';

export default class XTask extends XItem {
    adapt(data, ...args) {
        super.adapt(data, ...args);
        this.innerHTML = `<div>
            <h3><x-status status='${data.status}'></x-status>Task ${data.title ? data.title : data.id}</h3>
            <div class='messages'>${data.messages ? data.messages : ''}</div>
            <div class='details' >${data.details ? data.details : ''}</div>
        </div > `;
    }
}

window.customElements.define('x-task', XTask);
