
import Item from './item.js';
import {
    TYPE_INFO,
    STATUS_CREATED
} from '../common/constants.js';

export default class Info extends Item {
    static getType() {
        return TYPE_INFO;
    }

    constructor(title, value) {
        super(title);
        this.value = value;
        this.initialValue = value;
        this.notify(STATUS_CREATED);
    }
}
