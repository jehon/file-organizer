
import { getEntityId, notify } from './messenger.js';
import {
    STATUS_CREATED,
    STATUS_SUCCESS,
    STATUS_NEED_ACTION,
    STATUS_ACTED_SUCCESS
} from '../common/constants.js';

export default class Item {
    /** @type {number} */
    _id

    /** @type {string} */
    _title

    /** @type {File} */
    #parent

    /** @type {string} */
    _status

    constructor(title) {
        this._id = getEntityId();
        this._title = title;
        this.notify(STATUS_CREATED);

    }


    // ------------------------------------------
    //
    // Public properties
    //
    // ------------------------------------------

    static getType() {
        return 'Item';
    }

    get type() {
        return this.constructor.getType();
    }

    get subType() {
        return this.constructor.name;
    }

    get id() {
        return this._id;
    }

    get title() {
        return this._title;
    }

    get parent() {
        return this.#parent;
    }

    set parent(parent) {
        if (parent?.id == this.#parent?.id) {
            return;
        }
        this.#parent = parent;
        this.notify();
    }

    setParent(parent) {
        this.parent = parent;
        return this;
    }

    get status() {
        return this._status;
    }

    // ------------------------------------------
    //
    // Public methods
    //
    // ------------------------------------------

    static getNotifyProperties() {
        return ['id', 'type', 'subType', 'status', 'title'];
    }

    /**
     * Notify of a status change
     *
     * @param {string} status to be set and notified
     * @returns {Item} for chaining
     */
    notify(status = '') {
        if (status !== '') {
            this._status = status;
        }
        let data = {};
        if (this.parent) {
            data.parent = this.parent.id;
        }
        for (let i of this.constructor.getNotifyProperties()) {
            // data[i] = this[(i[0] == '#' ? i.substr(1) : i)];
            data[i] = this[i];
        }
        notify(data);
        return this;
    }

    doesNeedAction() {
        return this._status == STATUS_NEED_ACTION;
    }

    isSuccessFull() {
        return this._status == STATUS_SUCCESS
            || this._status == STATUS_ACTED_SUCCESS;
    }
}
