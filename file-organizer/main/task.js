
const Item = require('./item.js');
const { TYPE_TASK,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../constants.js');

class Task extends Item {
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

module.exports = Task;
module.exports.TaskSuccessFactory = (msg) => new Task(`success task ${msg}`, () => msg);
module.exports.TaskFailureFactory = (msg) => new Task(`failing task ${msg}`, () => { throw new Error(msg); });
