

import XItem from './x-item.js';
import './x-status.js';

export default class XFile extends XItem {
    adapt(data) {
        super.adapt(data);
        this.innerHTML = `<div>
            <h3><x-status status='${data.status}'></x-status>File ${data.currentFilePath}</h3>
        </div > `;
    }
}

window.customElements.define('x-file', XFile);
