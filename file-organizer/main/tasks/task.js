
const options = require('../../options.js');
const messenger = require('../../messenger.js');
const { TASK_CREATED, TASK_STARTED, TASK_SUCCESS, TASK_FAILURE } = require('../../constants.js');

module.exports = class Task {
    constructor(file, title, action) {
        this.id = messenger.getEntityId();
        this.file = file;
        this.title = title;
        this.action = action;
        this.category = '';
        this.messages = '';
        this.details = '';
        this.notify(TASK_CREATED);
    }

    withCategory(cat) {
        this.category = cat;
        return this;
    }

    notify(status) {
        messenger.notify({
            id: this.id,
            file: this.file.id,
            status: status,
            title: this.title,
            category: this.category,
            messages: this.messages,
            details: this.details
        });
    }

    result(skipped, success) {
        return {
            title: this.title,
            skipped,
            success: skipped ? false : success,
            messages: this.messages,
            details: this.details
        };
    }

    async run() {
        this.notify(TASK_STARTED);

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
        this.notify(res ? TASK_SUCCESS : TASK_FAILURE);
        return this.result(false, res);
    }
};
