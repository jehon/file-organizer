
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
        return super.getNotifyProperties().concat(['messages']);
    }

    static getType() {
        return TYPE_TASK;
    }

    constructor(title, action) {
        super(title);
        this.action = action;
        this.messages = '';
        this.notify(STATUS_NEED_ACTION);
    }

    async run() {
        this.notify(STATUS_ACTING);
        try {
            const res = await this.action();
            this.notify(STATUS_ACTED_SUCCESS);
            return res;
        } catch (e) {
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
