import path from 'path';

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

import { _regExpMapForFolders } from '../register-file-types.js';

import Value from '../value.js';

import { fileDelete, fileRename } from '../tasks-fs.js';

import timestampAPI from '../../../file-organizer/timestamp.js';
const { tsFromString } = timestampAPI;

import ValueCalculated from '../value-calculated.js';


const parentsMap = new Map();

export class FOError extends Error { }


/**
 * How does this work?
 *
 * - new File()
 * - analyse()
 *      will make the full "readonly" analysis
 *      will build up info (and values-problems)
 *      - initial (=current) and expected
 *
 * - checkConsistency()
 *      started by runAnalisys
 *      could not change anything
 *      check only "expected" values
 *      create problems
 *
 * - act()
 *      is only based on values
 *      the only "write" part of the process
 *      values{}.fix() (expected -> current)
 *
 */
export default class File extends Item {
    static getType() {
        return TYPE_FILE;
    }

    // ------------------------------------------
    //
    // Public properties
    //
    // ------------------------------------------
    /**
     * Without extension
     *
     * null mean the file has been deleted
     */
    static I_FILENAME = 'File_filename'

    /**
     * Format: .blabla (always have a dot)
     *
     * null mean the file has been deleted
     */
    static I_EXTENSION = 'File_extension'

    /**
     * true if it is a folder
     *
     * this will be set by the build file factory (in register-file-types)
     */
    static I_IS_FOLDER = 'File_is_folder';

    /**
     * In the filename, the title part
     */
    static I_FN_TITLE = 'File_title';

    /**
     * In the filename, the qualif filename part
     */
    static I_FN_QUALIF = 'File_qualif';

    /**
     * In the filename, the timestamp part
     */
    static I_FN_TIME = 'File_time';

    /** @type {string} */
    _path

    // /**
    //  * The actChain will fill in progressively, but should fire only
    //  * when starting the "act"
    //  *
    //  * @type {function(void): void}
    //  */
    // _actChainStart

    constructor(filePath, parent) {
        /* filepath is the title */
        super(filePath);
        this._path = filePath;

        if (parent) {
            this.parent = parent;
        }
        if (this.parent === undefined) {
            this.parent = this._calculateParent();
        }

        const vFn = new Value(fileUtils.getFilename(this._path));
        this.set(File.I_FILENAME, vFn);

        this.set(File.I_EXTENSION,
            new Value(fileUtils.getExtension(this._path))
        );

        /* Build up all informations and link them to I_FILENAME */

        /* auto update filename  */
        const updateFn = () => this.get(File.I_FILENAME).expect(this.getCanonicalFilename());

        // Handle initialization

        this.set(File.I_FN_QUALIF, new ValueCalculated(vFn, fn => tsFromString(fn).qualif));
        this.set(File.I_FN_TITLE, new ValueCalculated(vFn, fn => tsFromString(fn).title));
        this.set(File.I_FN_TIME, new ValueCalculated(vFn, fn => tsFromString(fn)));

        // Now that everything is intialized, let's handle change

        this.get(File.I_FN_QUALIF).onExpectedChanged(updateFn);
        this.get(File.I_FN_TITLE).onExpectedChanged(updateFn);
        this.get(File.I_FN_TIME).onExpectedChanged(updateFn);
    }

    /**
     * Get the current path from the file
     * based on "current" values
     *
     * @returns {string} absolute path
     */
    get currentFilePath() {
        if ((this.get(File.I_FILENAME).current == null) && (this.get(File.I_EXTENSION).current == null)) {
            return null;
        }
        let v = path.join(
            this.parent?.currentFilePath ?? '/',
            this.get(File.I_FILENAME).current + this.get(File.I_EXTENSION).current
        );
        return v;
    }

    get currentPath() {
        const cpath = this.parent ? this.parent.currentPath : '/';
        return path.join(cpath, this.get(File.I_FILENAME).current + this.get(File.I_EXTENSION).current);
    }

    getCanonicalFilename() {
        if (this.get(File.I_FILENAME).expected == null) {
            return null;
        }

        let proposedFilename = '';
        if (this.get(File.I_FN_TIME)?.expected.humanReadable()) {
            proposedFilename += this.get(File.I_FN_TIME).expected.humanReadable();
        }
        if (this.get(File.I_FN_TITLE)?.expected) {
            proposedFilename += ' ' + this.get(File.I_FN_TITLE).expected;
        }
        if (this.get(File.I_FN_QUALIF)?.current) {
            proposedFilename += ' [' + this.get(File.I_FN_QUALIF).current + ']';
        }
        if (!proposedFilename) {
            proposedFilename = this.get(File.I_FILENAME).expected;
        }
        return proposedFilename.trim();
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
     * Run the analysis on this element and generate infos
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
     * @returns {Promise<*>} resolved as analysis is done
     */
    async analyse() {
        return Promise.resolve()
            .then(() => {
                // Lowercase extension
                const currentExtension = this.get(File.I_EXTENSION).current;
                if (currentExtension.toLowerCase() != currentExtension) {
                    this.get(File.I_EXTENSION).expect(currentExtension.toLowerCase(), 'to lower case');
                }

                // Parse the qualif filename to see if it is a timestamp too
                // and take it as the source of thruth if applicable
                // TODO: this should move into timestamp ?
                if (this.get(File.I_FN_QUALIF).current) {
                    const ts2 = tsFromString(this.get(File.I_FN_QUALIF).current);
                    if (ts2.isTimestamped()) {
                        this.get(File.I_FN_TIME).expect(ts2, 'parse the qualif instead of the timestamp');
                    }
                }

                if (this.get(File.I_FN_QUALIF).expected && this.get(File.I_FN_TITLE).expected == this.get(File.I_FN_QUALIF).expected) {
                    // 'remove duplicate title/original'
                    this.get(File.I_FN_QUALIF).expect('', 'Original is a duplicate of the title');
                }
            });
    }

    /**
     * Check if all informationas are consistent
     *
     * @protected
     */
    checkConsistency() {
    }

    /**
     * Do the act based on .values
     *
     * If implemented by sub parts, call this parent at the latest
     *
     * @protected
     *
     * @returns {Promise<void>} when finished
     */
    async act() {
        return Promise.resolve()
            .then(() => {
                if (this.get(File.I_FILENAME).expected == null || this.get(File.I_EXTENSION).expected == null) {
                    return fileDelete(this);
                } else {
                    return fileRename(this);
                }
            });
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

    // // TODO (indexed): remember names to // rename
    // // @Limited(1)
    // async getIndexedFilename() {
    //     const o = this.calculatedTS.qualif;
    //     if (/^\d+$/.test(o)) {
    //         // Remove previous index (numerical)
    //         this.calculatedTS.qualif = '';
    //     }

    //     if (this.getCanonicalFilename() == this.get('filename').initial) {
    //         return this.getCanonicalFilename();
    //     }

    //     const p = (proposedFilename) => path.join(this.parent.getPath(), proposedFilename + this.get('extension').initial);

    //     return indexedFilenameLimiter(async () => {
    //         try {
    //             await fileUtils.checkAndReserveName(p(this.getCanonicalFilename()), this.currentFilePath);
    //             return this.getCanonicalFilename();
    //         } catch (_e) {
    //             // expected
    //         }

    //         this.calculatedTS.qualif = 1;
    //         while (this.calculatedTS.qualif != o) {
    //             try {
    //                 await fileUtils.checkAndReserveName(p(this.getCanonicalFilename()), this.currentFilePath);
    //                 return this.getCanonicalFilename();
    //             } catch (_e) {
    //                 //expected
    //             }
    //             this.calculatedTS.qualif++;
    //         }
    //     });
    // }

    /**
     * Run the analysis on this files, and all related one's (ex: FileFolder)
     *
     * @private
     *
     * @returns {Promise<File>} when completed
     */
    async runAnalyse() {
        this.notify(STATUS_ANALYSING);
        return this.analyse()
            .then(
                () => {
                    if (this.get(File.I_FILENAME).expected == null) {
                        // The file will be deleted anyway
                        this.notify(STATUS_NEED_ACTION);
                        return;
                    }

                    this.checkConsistency();

                    // Look for problems
                    if (this.problemsList.length > 0) {
                        this.notify(STATUS_FAILURE);
                        throw new FOError(this.problemsList.length + ' problem(s) found: ' + this.problemsList.join(' / '));
                    }

                    // Look at all values, and if some are note ok
                    // it means we have stuff to do
                    for (const v of Object.values(this.values)) {
                        if (!v.isDone()) {
                            this.notify(STATUS_NEED_ACTION);
                        }
                    }

                    // TODO: clean up this status
                    if (this.status == STATUS_ANALYSING) {
                        // We did not enqueue any action
                        this.notify(STATUS_SUCCESS);
                    }
                    return this;
                },
                (e) => {
                    this.notify(STATUS_FAILURE);
                    throw e;
                }
            );
    }

    /**
     * Do the real transformation
     *
     * @returns {Promise<void>} when finished
     */
    async runActing() {
        if (this.status == STATUS_SUCCESS) {
            return;
        }
        if (this.status != STATUS_NEED_ACTION) {
            throw new FOError('In invalid state: ' + this.status);
        }
        this.notify(STATUS_ACTING);

        return this.act()
            // .then(() => {
            //     // TODO: remove: Do the act on all enqueued acts
            //     this._actChainStart();
            //     return this._actChain;
            // })
            .then(() => {
                if (this.get(File.I_FILENAME).current == null) {
                    // The file will be deleted anyway
                    return;
                }

                const unsolved = Object.entries(this.values) // [ key, value ]
                    .filter(e => !e[1].isDone())
                    .map(e => e[0] + `(${JSON.stringify(e[1].expected)} vs ${JSON.stringify(e[1].current)})`);
                if (unsolved.length > 0) {
                    throw new FOError('Information not solved: ' + unsolved.join(', '));
                }
            })
            .then(
                () => {
                    this.notify(STATUS_ACTED_SUCCESS);
                },
                (e) => {
                    // TODO: handle error
                    this.error = e;
                    this.notify(STATUS_ACTED_FAILURE);
                    throw e;
                });
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
     * @returns {Promise<boolean>} when data is loaded
     */
    async loadData() {
        try {
            return this.runAnalyse()
                .then(() => true);
        } catch (e) {
            return false;
        }
    }

    /**
     * @deprecated TODO: Mock of previous version
     * @returns {Promise<void>} when data is loaded
     */
    async check() {
        if (options.dryRun) {
            return;
        }
        return this.runActing();
    }

    /**
     * @deprecated
     * @returns {string} current path
     */
    getPath() {
        return this.currentFilePath;
    }
}
