
import { getEntityId, notify } from './messenger.js';
import {
    STATUS_CREATED,
    STATUS_SUCCESS,
    STATUS_NEED_ACTION,
    STATUS_ACTED_SUCCESS
} from '../common/constants.js';

export default class Item {
    static getNotifyProperties() {
        return ['id', 'type', 'subType', 'status', 'title'];
    }

    static getType() {
        return 'Item';
    }

    constructor(title = '', parent) {
        this.id = getEntityId();
        this.title = title;
        this.parent = parent;
        this.notify(STATUS_CREATED);
    }

    get type() {
        return this.constructor.getType();
    }

    get subType() {
        return this.constructor.name;
    }

    setParent(parent) {
        this.parent = parent;
        this.notify();
        return this;
    }

    notify(status = '') {
        if (status !== '') {
            this.status = status;
        }
        let data = {};
        if (this.parent) {
            data.parent = this.parent.id;
        }
        for (let i of this.constructor.getNotifyProperties()) {
            data[i] = this[i];
        }
        notify(data);
        return this;
    }

    doesNeedAction() {
        return this.status == STATUS_NEED_ACTION;
    }

    isSuccessFull() {
        return this.status == STATUS_SUCCESS
            || this.status == STATUS_ACTED_SUCCESS;
    }
}
