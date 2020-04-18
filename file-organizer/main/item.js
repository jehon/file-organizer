
const messenger = require('./messenger.js');
const {
    STATUS_CREATED,
} = require('../constants.js');

module.exports = class Item {
    static getNotifyProperties() {
        return ["id", "type", "subType", "status", "title"];
    }

    static getType() {
        return "Item";
    }

    constructor(title = "") {
        this.id = messenger.getEntityId();
        this.title = title;
        this.parent = false;
        this.notify(STATUS_CREATED);
    }

    get type() {
        return this.constructor.getType();
    }

    get subType() {
        return this.constructor.name;
    }

    withParent(parent) {
        this.parent = parent;
        this.notify();
        return this;
    }

    notify(status = false) {
        if (status !== false) {
            this.status = status;
        }
        let data = {
            parent: this.parent.id
        }
        for (let i of this.constructor.getNotifyProperties()) {
            data[i] = this[i];
        }
        messenger.notify(data);
        return this;
    }

};
