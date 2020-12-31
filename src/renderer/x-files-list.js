
import './x-file.js';

import XList from './x-list.js';

import {
    TYPE_FILE,
} from '../common/constants.js';

export default class XFilesList extends XList {

    /**
     * @override
     */
    listenerFilter(item) {
        if (TYPE_FILE != item.type) {
            return false;
        }
        return super.listenerFilter(item);
    }

    /**
     * @override
     */
    getChildElement(item) {
        return `<x-file x-id="${item.id}">${item.id} - ${item.currentFilePath}</x-file>`;
    }
}

window.customElements.define('x-files-list', XFilesList);
