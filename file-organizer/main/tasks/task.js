
const options = require('../../options.js');
const messenger = require('../../messenger.js');
const { TASK_CREATED, TASK_SKIPPED, TASK_STARTED, TASK_SUCCESS, TASK_FAILURE, TASK_FINALLY } = require('../../constants.js');

module.exports = class Task {
    constructor(file, title, action) {
        this.id = messenger.getEntityId();
        this.file = file;
        this.title = title;
        this.action = action;
        this.messages = '';
        this.details = '';
        this.notify(TASK_CREATED);
    }

    notify(type) {
        messenger.notify(this.id, {
            file: this.file.id,
            type
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

    async runIfCommit() {
        if (options.dryRun) {
            this.notify(TASK_SKIPPED);
            this.notify(TASK_FINALLY);
            return this.result(true);
        }
        return this.run();
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
        this.notify(TASK_FINALLY);
        return this.result(false, res);
    }
}
