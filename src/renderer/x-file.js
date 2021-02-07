

import XFilesList from './x-files-list.js';
import XItem from './x-item.js';

export default class XFile extends XItem {

    /**
     * @override
     */
    getListingElement(item) {
        const el = new XFilesList();
        el.setAttribute('x-parent', item.id);
        return el;
    }
}

window.customElements.define('x-file', XFile);
