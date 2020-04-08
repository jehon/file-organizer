

require('./x-status.js');

const XItem = require('./x-item.js');

class XFile extends XItem {
    adapt(data, ...args) {
        super.adapt(data, ...args);
        this.innerHTML = `<div>
            <h3><x-status status='${data.status}'></x-status>Task ${data.title ? data.title : data.id}</h3>
        </div > `;
    }
}

window.customElements.define('x-file', XFile);
