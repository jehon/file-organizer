

import './x-status.js';
import './x-tasks-list.js';

import XItem from './x-item.js';

export default class XFile extends XItem {
    adapt(data) {
        super.adapt(data);
        this.innerHTML = `<div>
            <h3><x-status status='${data.status}'></x-status>File ${data.path}</h3>
            <x-tasks-list parent='${data.id}'></x-tasks-list>
        </div > `;
    }
}

window.customElements.define('x-file', XFile);
