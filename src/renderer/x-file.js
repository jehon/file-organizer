

import XItem from './x-item.js';

export default class XFile extends XItem {

    /**
     * @override
     */
    getListingElement(item) {
        return `<x-files-list x-parent=${item.id}></x-files-list>`;
    }
}

window.customElements.define('x-file', XFile);
