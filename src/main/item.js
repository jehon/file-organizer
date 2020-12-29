
import { getEntityId, notify } from './messenger.js';
import {
    STATUS_CREATED,
    STATUS_SUCCESS,
    STATUS_NEED_ACTION,
    STATUS_ACTED_SUCCESS
} from '../common/constants.js';

export default class Item {
    /**
     * If the file is given by arguments
     * and thus the top of a hierarchy
     *
     * @type {boolean}
     */
    #isTop = false;

    /** @type {number} */
    _id

    /** @type {string} */
    _title

    /** @type {Item} */
    _parent

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

    set isTop(v) {
        this.#isTop = v;
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
        return this._parent;
    }

    set parent(parent) {
        if (parent?.id == this._parent?.id) {
            return;
        }
        this._parent = parent;
        this.notify();
    }

    setParent(parent) {
        this.parent = parent;
        return this;
    }

    get status() {
        return this._status;
    }

    /**
     * @type {object} with all the infos
     */
    values = {};

    /**
     * Add a value
     *
     * @protected
     * @param {string} key of the value
     * @param {module:file-organizer/main/Value} value to be added (see info-* files)
     * @returns {module:src/main/Value} the constructed value
     */
    set(key, value) {
        this.values[key] = value;
        return value;
    }

    get(key) {
        return this.values[key];
    }

    problemsList = []

    /**
     * [Tool for specialized classes]
     *
     * Add a problem to the file
     *
     * @protected
     *
     * @param {string} description of the problem
     * @returns {Item} for chaining
     */
    addProblem(description) {
        this.problemsList.push(description);
        return this;
    }

    /**
     * Resolve a problem (remove from list)
     *
     * @protected
     *
     * @param {string} description of the problem
     * @returns {Item} for chaining
     */
    resolveProblem(description) {
        const index = this.problemsList.indexOf(description);
        if (index > -1) {
            this.problemsList.splice(index, 1);
        }
        return this;
    }
    /**
     * @param {string} id of the problem
     * @returns {boolean} if it is present
     */
    hasProblem(id) {
        return this.problemsList.indexOf(id) > -1;
    }

    // ------------------------------------------
    //
    // Public methods
    //
    // ------------------------------------------

    static getNotifyProperties() {
        return ['isTop', 'id', 'type', 'subType', 'status', 'title'];
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

    toJSON() {
        return {
            id: this.id,
            _status: this._status,
            values: this.values,
            problemsList: this.problemsList
        };
    }
}