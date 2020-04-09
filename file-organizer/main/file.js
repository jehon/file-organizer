

const messenger = require('./messenger.js');
const { TYPE_FILE,
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE, // TODO
    STATUS_SUCCESS, // TODO
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

    async runAnalyse() {
        this.notify(STATUS_ANALYSING)
        this.analyse().then(
            (d) => {
                console.log("run analysis done", this.status);
                if (this.status == STATUS_ANALYSING) {
                    // We did not enqueue any action
                    this.notify(STATUS_SUCCESS);
                }
                return d;
            },
            (e) => {
                this.notify(STATUS_FAILURE);
                throw e;
            }
        )
    }

    async analyse() {
        // TODO: success & failure ?
        return Promise.resolve();
    }

    enqueueAct(t) {
        this.notify(STATUS_NEED_ACTION);
        t.parent = this.id;
        this.actChain = this.actChain.then(t.run)
        return this;
    }

    async act() {
        this.notify(STATUS_ACTING);
        this.actChain.then(
            (data) => { this.notify(STATUS_ACTED_SUCCESS); return data; },
            (e) => { this.notify(STATUS_ACTED_FAILURE); throw e; }
        );
        return this.actChainStart();
    }

};
