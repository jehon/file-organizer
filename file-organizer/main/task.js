
const messenger = require('./messenger.js');
const { TYPE_TASK,
    STATUS_CREATED,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../constants.js');

class Task {
    constructor(title, action) {
        this.id = messenger.getEntityId();
        this.parent = -1;
        this.title = title;
        this.action = action;
        this.category = '';
        this.messages = '';
        this.details = '';
        this.notify(STATUS_CREATED);
        this.notify(STATUS_NEED_ACTION);
    }

    withParent(parent) {
        this.parent = parent;
        this.notify();
        return this;
    }

    // withCategory(cat) {
    //     this.category = cat;
    //     return this;
    // }

    notify(status) {
        if (status) {
            this.status = status;
        }
        messenger.notify({
            id: this.id,
            type: TYPE_TASK,
            parent: this.parent.id,
            status: this.status,
            title: this.title,
            category: this.category,
            messages: this.messages,
            details: this.details
        });
        return this;
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
