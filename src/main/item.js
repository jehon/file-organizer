
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
    #id

    /** @type {string} */
    #title

    /** @type {Item} */
    #parent = null

    /** @type {string} */
    #status = STATUS_CREATED

    constructor(title) {
        this.#id = getEntityId();
        this.#title = title;
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

    get isTop() {
        return this.#isTop;
    }

    get type() {
        return this.constructor.getType();
    }

    get subType() {
        return this.constructor.name;
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    get parent() {
        return this.#parent;
    }

    get parentId() {
        return this.parent?.id;
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
        return this.#status;
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

    /**
     * Notify of a status change
     *
     * @param {string} status to be set and notified
     * @returns {Item} for chaining
     */
    notify(status = '') {
        if (status !== '') {
            this.#status = status;
        }
        notify(this);
        return this;
    }

    doesNeedAction() {
        return this.#status == STATUS_NEED_ACTION;
    }

    isSuccessFull() {
        return this.#status == STATUS_SUCCESS
            || this.#status == STATUS_ACTED_SUCCESS;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            subType: this.subType,
            isTop: this.isTop,
            status: this.#status,
            title: this.title,
            parentId: this.parentId,
            values: this.values,
            problemsList: this.problemsList
        };
    }
}