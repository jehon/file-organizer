
import Item from '../item.js';
import options from '../../../file-organizer/options.js';
import {
    TYPE_FILE,
    STATUS_ANALYSING,
    STATUS_FAILURE,
    STATUS_SUCCESS,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} from '../../common/constants.js';

import fileUtils from '../../../file-organizer/file-utils.js';
import { regExpMap } from '../register-file-types.js';
// import { buildFolder } from '../main/loadFileTypes.js';

import path from 'path';

const parentsMap = new Map();

/**
 * How does this work?
 *
 * - new File()
 * - analyse()
 *      will make the full "readonly" analysis
 *      will build up info (and info-problems)
 *      will enqueue Tasks
 *
 * if necessary, it will "doAct"
 */
export default class File extends Item {
    static getNotifyProperties() {
        return super.getNotifyProperties().concat(['path']);
    }

    static getType() {
        return TYPE_FILE;
    }

    constructor(filePath, parent) {
        super(filePath, parent);
        this.path = filePath;
        this.actChain = new Promise((resolve, reject) => {
            this.actChainStart = resolve;
            this.actChainAbort = reject;
        });
        if (this.parent === undefined) {
            this._calculateParent();
            this.notify();
        }
    }

    /**
     * @returns {string} filename without extension
     */
    get filename() {
        return fileUtils.getFilename(this.path);
    }

    /**
     * Format: .blabla
     *
     * @returns {string} the extension (with a dot: .blabla)
     */
    get extension() {
        return fileUtils.getExtension(this.path);
    }

    // ------------------------------------------------
    //
    // TO BE USED BY SPECIALIZED FILES
    //
    // ------------------------------------------------

    /**
     * [Tool for specialized classes]
     *
     * Run the analysis on this element and generate tasks
     *   - task to analysis (createAnalysisTaskAndRunIt)
     *   - task to fix (enqueueAct)
     *
     * This is a mock, and should be implemented by childrends
     *
     * @returns {Promise<void>}
     */
    /* abstract */ async analyse() {
        // TODO: success & failure ?
        return Promise.resolve();
    }

    /**
     * [Tool for specialized classes]
     *
     * Add a task to fix a problem
     *
     * @param {module:file-organizer/main/Task} t to be enqueued
     * @returns {File} this for chaining
     */
    addFixAct(t) {
        this.notify(STATUS_NEED_ACTION);
        t.setParent(this);
        this.actChain = this.actChain.then(() => t.run());
        return this;
    }

    /**
     * @type {Map<string,string>} with all the infos
     */
    infosMap = new Map()

    /**
     * [Tool for specialized classes]
     *
     * Add an info to the file
     *
     * @param {module:file-organizer/main/Info} infoClass to be added (see info-* files)
     * @param  {...any} args to be passed to the constructor of the info
     * @returns {module:file-organizer/main/Info} the constructed info
     */
    addInfo(infoClass, ...args) {
        // TODO: how to link this to the file ???
        const i = new infoClass(...args);
        i.setParent(this);
        this.infosMap.set(i.title, i);
        return i;
    }

    /**
     * [Tool for specialized classes]
     *
     * Add a task to the file
     * This task is an analasys task
     *
     * @param {module:file-organizer/main/Task} taskClass to be added (see task-* files)
     * @param {...any} args to be passed to the constructor of the info
     * @returns {module:file-organizer/main/Task} the constructed info
     */
    async addAnalysisTask(taskClass, ...args) {
        return (new taskClass(...args, this)).run();
    }


    // ------------------------------------------------
    //
    // TO BE USED ON FILE ONLY
    //
    // ------------------------------------------------

    _calculateParent() {
        let parentDir = path.dirname(this.path);
        if (parentDir == '/') {
            this.parent = false;
        } else {
            if (parentDir == '.') {
                parentDir = process.cwd();
            }

            if (!parentsMap.has(parentDir)) {
                parentsMap.set(parentDir,
                    // buildFolderFn(parentDir)
                    // TODO: remove this horrible hack  (file-folder)
                    new (regExpMap.get('//'))(parentDir)
                );
            }
            this.parent = parentsMap.get(parentDir);
        }
        return this.parent;
    }

    /**
     * Run the analysis on this files, and all related one's (ex: FileFolder)
     *
     * @returns {Promise<void>} when completed
     */
    /* final */ async runAnalyse() {
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

    /**
     * Do the act on all enqueued acts
     *
     * @returns {Promise<boolean>} when finished (true if success)
     */
    /* final */ async act() {
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

    // ------------------------------------------------
    //
    // TODO: LEGACY BRIDGE
    //
    // ------------------------------------------------

    /**
     * TODO: Mock of previous version
     */
    iterate() { }

    /**
     * TODO: Mock of previous version
     */
    async loadData() { return this.runAnalyse(); }

    /**
     * TODO: Mock of previous version
     */
    async check() {
        return Promise.resolve()
            .then(() => options.dryRun ? true : this.act())
            .then(() => true);
    }
}
