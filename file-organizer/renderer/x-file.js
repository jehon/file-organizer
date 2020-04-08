

require('./x-status.js');
require('./x-tasks-list.js');

const XItem = require('./x-item.js');

class XFile extends XItem {
    adapt(data, ...args) {
        super.adapt(data, ...args);
        this.innerHTML = `<div>
            <h3><x-status status='${data.status}'></x-status>File ${data.path}</h3>
            <x-tasks-list parent='${data.id}'></x-tasks-list>
        </div > `;
    }
}

window.customElements.define('x-file', XFile);
