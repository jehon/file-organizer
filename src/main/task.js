
import Item from './item.js';
import {
    TYPE_TASK,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} from '../common/constants.js';

export default class Task extends Item {
    static getNotifyProperties() {
        return [...super.getNotifyProperties(), 'messages'];
    }

    static getType() {
        return TYPE_TASK;
    }

    /**
     * @type {Function} to make the task
     */
    _action

    constructor(title, action) {
        super(title);
        this._action = action;
        this.messages = ''; // TODO: setter to auto notify?
        this.notify(STATUS_NEED_ACTION);

        // ------------------------------------------
        //
        // Public properties
        //
        // ------------------------------------------
    }

    get action() {
        return this._action;
    }

    // ------------------------------------------
    //
    // Public methods
    //
    // ------------------------------------------

    async run() {
        this.notify(STATUS_ACTING);
        try {
            const res = await this.action();
            this.notify(STATUS_ACTED_SUCCESS);
            return res;
        } catch (e) {
            // If the message has not been already set (by a subclass?)
            if (!this.messages) {
                this.messages = e;
            }
            this.notify(STATUS_ACTED_FAILURE);
            throw e;
        }
    }
}

/**
 * @param {string} title of the task
 * @returns {Task} created
 */
export function _TaskSuccessFactory(title) {
    return new Task(`Success task ${title}`, () => title);
}

/**
 * @param {string} title of the task
 * @returns {Task} created
 */
export function _TaskFailureFactory(title) { return new Task(`Failing task ${title}`, () => { throw new Error(title); }); }
