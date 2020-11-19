
import Item from './item.js';
import {
    TYPE_INFO,
    STATUS_CREATED
} from '../common/constants.js';

export default class Info extends Item {
    static getType() {
        return TYPE_INFO;
    }

    /** type {*} */
    _initialValue

    constructor(key, value) {
        super(key);
        this._initialValue = value;
        this.notify(STATUS_CREATED);

        // ------------------------------------------
        //
        // Public properties
        //
        // ------------------------------------------
    }

    get initialValue() {
        return this._initialValue;
    }
}
