
const Item = require('./item.js');
const options = require('../options.js');
const { TYPE_FILE,
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE,
    STATUS_SUCCESS,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../constants.js');
const fileUtils = require('../file-utils.js');

const path = require('path');

const parentsMap = new Map();

module.exports = class File extends Item {
    static getNotifyProperties() {
        return super.getNotifyProperties().concat(['path']);
    }

    static getType() {
        return TYPE_FILE;
    }

    constructor(filePath) {
        super(filePath);
        this.path = filePath;
        this.actChain = new Promise((resolve, reject) => {
            this.actChainStart = resolve;
            this.actChainAbort = reject;
        });
        this.parent = null;
        this.calculateParent();
        this.notify();
    }

    /**
     * Without extension
     */
    get filename() {
        return fileUtils.getFilename(this.path);
    }

    /**
     * Format: .blabla
     */
    get extension() {
        return fileUtils.getExtension(this.path);
    }

    calculateParent() {
        if (this.parent === null) {
            let parentDir = path.dirname(this.path);
            if (parentDir == '/') {
                this.parent = false;
            } else {
                if (parentDir == '.') {
                    parentDir = process.cwd();
                }

                if (!parentsMap.has(parentDir)) {
                    parentsMap.set(parentDir,
                        new (require('./file-folder.js'))(parentDir));
                }
                this.parent = parentsMap.get(parentDir);
            }
        }
        return this.parent
    }

    async createAndRun(taskClass, ...args) {
        const t = (new taskClass(...args))
            .withParent(this);
        return t.run();
    }

    async runAnalyse() {
        this.notify(STATUS_ANALYSING);
        return this.analyse().then(
            (d) => {
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
        );
    }

    async analyse() {
        // TODO: success & failure ?
        return Promise.resolve();
    }

    enqueueAct(t) {
        this.notify(STATUS_NEED_ACTION);
        t.withParent(this);
        this.actChain = this.actChain.then(() => t.run());
        return this;
    }

    async act() {
        if (this.status != STATUS_NEED_ACTION) {
            if (this.status == STATUS_SUCCESS) {
                return true;
            }
            return false;
        }
        this.notify(STATUS_ACTING);
        this.actChainStart();
        return this.actChain.then(
            (data) => { this.notify(STATUS_ACTED_SUCCESS); return data; },
            (e) => { this.notify(STATUS_ACTED_FAILURE); throw e; }
        );
    }

    async loadData() { return this.runAnalyse(); }

    async check() {
        return Promise.resolve()
            .then(() => options.dryRun ? true : this.act())
            .then(() => true);
    }
};
