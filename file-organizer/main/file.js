

const messenger = require('./messenger.js');
const { TYPE_FILE,
    STATUS_CREATED,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../constants.js');

const Task = require('./task.js');

module.exports = class File {
    constructor(path, parent = null) {
        this.id = messenger.getEntityId();
        this.path = path;
        this.parent = parent;
        this.notify(STATUS_CREATED);
        this.actChain = new Promise((resolve, reject) => {
            this.actChainStart = resolve;
            this.actChainAbort = reject;
        });
    }

    notify(status) {
        this.status = status;
        messenger.notify({
            id: this.id,
            type: TYPE_FILE,
            path: this.path,
            parent: this.parent,
            status: this.status,
        });
        return this;
    }

    async createAndRun(_class, title, action) {
        const t = new Task(this, title, action);
        return t.run();
    }

    enqueueAct(t) {
        t.parent = this.id;
        this.actChain = this.actChain.then(t.run);
        return this;
    }

    async act() {
        return this.actChainStart();
    }

    async analyse() {
        return Promise.resolve();
    }
};
