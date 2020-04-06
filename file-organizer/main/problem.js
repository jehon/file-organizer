
const messenger = require('../../main/messenger.js');
const { TYPE_PROBLEM,
    STATUS_CREATED,
    STATUS_FAILURE,
    STATUS_NEED_ACTION,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../../constants.js');

module.exports = class Problem {
    constructor(file, title, details = '') {
        this.id = messenger.getEntityId();
        this.file = file;
        this.title = title;
        this.details = details;
        this.notify(STATUS_CREATED);
    }

    notify(status) {
        this.status = status;
        messenger.notify({
            id: this.id,
            type: TYPE_PROBLEM,
            file: this.file.id,
            status: this.status,
            title: this.title,
            details: this.details
        });
    }

    resolveWith(task) {
        this.notify(STATUS_NEED_ACTION);
        this.task = task
            .then((data) => {
                this.notify(STATUS_ACTED_SUCCESS);
                return data;
            }, (error) => {
                this.notify(STATUS_ACTED_FAILURE);
                throw error;
            })
    }

    impossible() {
        this.notify(STATUS_FAILURE);
    }
}
