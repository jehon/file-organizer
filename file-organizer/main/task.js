
const messenger = require('./messenger.js');
const { TYPE_TASK,
    STATUS_CREATED,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../constants.js');

module.exports = class Task {
    constructor(file, title, action) {
        this.id = messenger.getEntityId();
        this.file = file;
        this.title = title;
        this.action = action;
        this.category = '';
        this.messages = '';
        this.details = '';
        this.notify(STATUS_CREATED);
        this.notify(STATUS_NEED_ACTION);
    }

    withCategory(cat) {
        this.category = cat;
        return this;
    }

    notify(status) {
        this.status = status;
        messenger.notify({
            id: this.id,
            type: TYPE_TASK,
            file: this.file.id,
            status: this.status,
            title: this.title,
            category: this.category,
            messages: this.messages,
            details: this.details
        });
    }

    result(success) {
        return {
            title: this.title,
            success,
            messages: this.messages,
            details: this.details
        };
    }

    async run() {
        this.notify(STATUS_ACTING);

        let res = true;
        try {
            res = await this.action();

            if (res === undefined) {
                res = true;
            }
        } catch (e) {
            this.messages = e;
            res = false;
        }
        if (!res) {
            this.notify(STATUS_ACTED_FAILURE);
            throw this.result(false);
        }

        this.notify(STATUS_ACTED_SUCCESS);
        return this.result(true);
    }
};
