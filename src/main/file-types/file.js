
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
// import { buildFolder } from '../main/loadFileTypes.js';

import path from 'path';
import { _regExpMapForFolders } from '../register-file-types.js';

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
    static getType() {
        return TYPE_FILE;
    }

    /** @type {string} */
    _path

    /** @type {Promise<void>} */
    _actChain

    /**
     * The actChain will fill in progressively, but should fire only
     * when starting the "act"
     *
     * @type {function(void): void}
     */
    _actChainStart

    constructor(filePath, parent) {
        /* filepath is the title */
        super(filePath);
        this._path = filePath;
        this._actChain = new Promise(resolve => {
            // We will trigger the actChain only on the "doAct" part
            this._actChainStart = resolve;
        });
        if (parent) {
            this.parent = parent;
        }
        if (this.parent === undefined) {
            this.parent = this._calculateParent();
        }
    }

    // ------------------------------------------
    //
    // Public properties
    //
    // ------------------------------------------

    /**
     * @returns {string} filename without extension
     */
    get filename() {
        return fileUtils.getFilename(this._path);
    }

    /**
     * Format: .blabla
     *
     * @returns {string} the extension (with a dot: .blabla)
     */
    get extension() {
        return fileUtils.getExtension(this._path);
    }

    get path() {
        return this._path;
    }

    // ------------------------------------------
    //
    // Protected methods
    //
    // TO BE USED BY SPECIALIZED FILES
    //
    // ------------------------------------------------

    /**
     * @returns {Array<string>} the properties that will go to the browser
     */
    static getNotifyProperties() {
        return [...super.getNotifyProperties(), 'path', 'problemsList', 'infos'];
    }

    /**
     * [Tool for specialized classes]
     *
     * Run the analysis on this element and generate tasks
     *
     * Flow:
     *   - call super.analyse() => initialize the above layers
     *   - analisysAddInfo with the information from the layer
     *   - set the expected values from the layer and the above layers
     *   - analisysAddInfo(InfoProblems)
     *   - enqueueAct() with non-info related fixes (should be on top elements)
     *
     *   - add an info (addInfo)
     *   - task to fix (enqueueAct)
     *
     * This is a mock, and should be implemented by childrends
     *
     * @abstract
     *
     * @returns {Promise<void>}
     */
    async analyse() {
        return Promise.resolve();
    }

    /**
     * [Tool for specialized classes]
     *
     * Add a task to fix a problem
     *
     * @protected
     *
     * @param {module:file-organizer/main/Task} t to be enqueued
     * @returns {File} this for chaining
     */
    analysisAddFixAct(t) {
        this.notify(STATUS_NEED_ACTION);
        t.setParent(this);
        this._actChain = this._actChain.then(() => t.run());
        return this;
    }

    /**
     * @type {Map<string,string>} with all the infos
     */
    infos = new Map()

    /**
     * [Tool for specialized classes]
     *
     * Add an info to the file
     *
     * @protected
     *
     * @param {module:file-organizer/main/Info} infoClass to be added (see info-* files)
     * @param  {...any} args to be passed to the constructor of the info
     * @returns {module:file-organizer/main/Info} the constructed info
     */
    analysisAddInfo(infoClass, ...args) {
        const i = new infoClass(...args);
        i.setParent(this);
        this.infos.set(i.title, i);
        return i;
    }

    problemsList = []

    /**
     * [Tool for specialized classes]
     *
     * Add a problem to the file
     *
     * @param {string} description of the problem
     *
     * @protected
     */
    analysisAddProblem(description) {
        this.problemsList.push(description);
        this.status = STATUS_FAILURE;
        this.notify();
    }

    // ------------------------------------------
    //
    // Private methods
    //
    // ------------------------------------------

    /**
     * @private
     *
     * @returns {File} the potential parent
     */
    _calculateParent() {
        let parentDir = path.dirname(this._path);
        if (parentDir == '/') {
            return null;
        }

        if (parentDir == '.') {
            parentDir = process.cwd();
        }

        if (!parentsMap.has(parentDir)) {
            parentsMap.set(parentDir,
                // buildFolderFn(parentDir)
                // TODO(file-folder): remove this horrible hack
                new (_regExpMapForFolders.get('//'))(parentDir)
            );
        }
        return parentsMap.get(parentDir);
    }

    /**
     * Run the analysis on this files, and all related one's (ex: FileFolder)
     *
     * @private
     *
     * @returns {Promise<void>} when completed
     */
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

    /**
     * Do the act on all enqueued acts
     *
     * @private
     *
     * @returns {Promise<void>} when finished
     */
    /* final */ async act() {
        if (this.status != STATUS_NEED_ACTION) {
            if (this.status == STATUS_SUCCESS) {
                return;
            }
            throw 'In invalid state: ' + this.status;
        }
        this.notify(STATUS_ACTING);
        this._actChainStart();
        return this._actChain.then(
            () => { this.notify(STATUS_ACTED_SUCCESS); },
            (e) => { this.notify(STATUS_ACTED_FAILURE); throw e; }
        );
    }

    // ------------------------------------------------
    //
    // TODO(migration): LEGACY BRIDGE
    //
    // ------------------------------------------------

    /**
     * @deprecated TODO: Mock of previous version
     */
    iterate() { }

    /**
     * @deprecated TODO: Mock of previous version
     */
    async loadData() { return this.runAnalyse(); }

    /**
     * @deprecated TODO: Mock of previous version
     */
    async check() {
        if (options.dryRun) {
            return;
        }
        return this.act();
    }
}
