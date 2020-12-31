import path from 'path';
import fs from 'fs';

import Item from '../item.js';
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

import { folderListing } from '../fs-utils.js';

import { buildFile, FallBackRegExp, registerRegExp } from '../register-file-types.js';

import Value from '../value.js';

import { fileDeleteAndRelease, fileRename } from '../fs-utils.js';

import { parseFilename } from '../timestamp.js';

import ValueCalculated from '../value-calculated.js';
import ValueConstant from '../value-constant.js';

export class FOError extends Error { }

/**
 * How does this work?
 *
 * - buildFile()
 * - loadData()
 *      will make the full "readonly" analysis
 *      will build up info (and values-problems)
 *      - initial (=current) and expected
 *
 * - runPrepare() / prepare()
 *      manage options
 *      could not change anything
 *      check only "expected" values
 *      create problems
 *
 * - runFix() / fix()
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
     *  null mean the file has been deleted
     */
    static I_EXTENSION = 'File_extension'

    /** true if it is a folder */
    static I_IS_FOLDER = 'File_is_folder';

    /** In the filename parsing, the type of parsing applied */
    static I_F_TYPE = 'File_type';

    /** In the filename, the title part */
    static I_F_TITLE = 'File_title';

    /** In the filename, the qualif filename part  */
    static I_F_QUALIF = 'File_qualif';

    /** In the filename, the timestamp part */
    static I_F_TIME = 'File_time';

    /**
     * it is absolute
     *
     * @type {string}
     */
    _initialPath

    /**
     * cache
     *
     * @type {File[]}
     *
     */
    #children = null

    constructor(filePath) {
        /* filepath is the title */
        super(path.basename(filePath));
        this._initialPath = path.resolve(filePath);

        { // Calculate the parent
            let parentDir = path.dirname(this.initialPath);
            if (parentDir != '/') {
                this.parent = buildFile(parentDir);
            }
        }
        this.notify(STATUS_ANALYSING);

        const vFn = new Value(path.parse(this.initialPath).name);
        this.set(File.I_FILENAME, vFn);

        this.set(File.I_EXTENSION, new Value(path.parse(this.initialPath).ext));

        let isFolder = false;
        try {
            isFolder = fs.statSync(this.currentFilePath).isDirectory();
        } catch (e) {
            // For testing purpose, if a file does not exists, it is not a folder
            if (!(e instanceof Error)
                /** eslint-ignore-next-line */
                || (e instanceof Error && e.code !== 'ENOENT')) {
                throw e;
            }
        }
        this.set(File.I_IS_FOLDER, new ValueConstant(isFolder));

        /* Build up all informations and link them to I_FILENAME */

        // TODO: handle unparsable filenames ?
        // TODO: handle I_F_TYPE

        /* auto update filename  */
        const updateFn = () => this.get(File.I_FILENAME).expect(this.getCanonicalFilename());

        // Handle initialization

        this.set(File.I_F_QUALIF, new ValueCalculated(vFn, fn => parseFilename(fn).qualif));
        this.set(File.I_F_TITLE, new ValueCalculated(vFn, fn => parseFilename(fn).title));
        this.set(File.I_F_TIME, new ValueCalculated(vFn, fn => parseFilename(fn).time));
        // this.set(File.I_F_TYPE, new ValueCalculated(vFn, fn => parseFilename(fn).type));

        // Now that everything is intialized, let's handle change

        this.get(File.I_F_QUALIF).onExpectedChanged(updateFn);
        this.get(File.I_F_TITLE).onExpectedChanged(updateFn);
        this.get(File.I_F_TIME).onExpectedChanged(updateFn);
        // this.get(File.I_F_TYPE).expect('')
    }

    get initialPath() {
        return this._initialPath;
    }

    /**
     * Get the current path from the file
     * based on "current" values
     *
     * @returns {string} absolute path
     */
    get currentFilePath() {
        if (!this.get(File.I_FILENAME)?.current && !this.get(File.I_EXTENSION)?.current) {
            return null;
        }
        let v = path.join(
            this.parent?.currentFilePath ?? '/',
            this.get(File.I_FILENAME).current + this.get(File.I_EXTENSION).current
        );
        return v;
    }

    get children() {
        if (this.#children === null) {
            if (this.get(File.I_IS_FOLDER).current) {
                this.#children = folderListing(this)
                    .map(f => buildFile(path.join(this.currentFilePath, f), this));
            } else {
                this.#children = [];
            }
        }
        return this.#children;
    }

    getCanonicalFilename() {
        if (this.get(File.I_FILENAME).expected == null) {
            return null;
        }

        let proposedFilename = '';
        if (this.get(File.I_F_TIME)?.expected) {
            proposedFilename += this.get(File.I_F_TIME).expected;
        }
        if (this.get(File.I_F_TITLE)?.expected) {
            proposedFilename += ' ' + this.get(File.I_F_TITLE).expected;
        }
        if (this.get(File.I_F_QUALIF)?.current) {
            proposedFilename += ' [' + this.get(File.I_F_QUALIF).current + ']';
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
     * [Tool for specialized classes]
     *
     * Run the analysis on this element and generate infos
     *
     * Flow:
     *   - call super.analyse() => initialize the above layers
     *   - analisysAddInfo with the information from the layer
     *   - set the expected values from the layer and the above layers
     *
     * This is a mock, and should be implemented by children
     *
     * @returns {Promise<File>} resolved as analysis is done
     */
    async loadData() {
        // Lowercase extension
        const currentExtension = this.get(File.I_EXTENSION).current;
        if (currentExtension.toLowerCase() != currentExtension) {
            this.get(File.I_EXTENSION).expect(currentExtension.toLowerCase(), 'to lower case');
        }

        // Parse the qualif filename to see if it is a timestamp too
        // and take it as the source of thruth if applicable
        // TODO(timestamp): this should move into timestamp ?
        if (this.get(File.I_F_QUALIF).current) {
            const ts2 = parseFilename(this.get(File.I_F_QUALIF).current).time;
            if (ts2) {
                this.get(File.I_F_TIME).expect(ts2, 'parse the qualif instead of the timestamp');
            }
        }

        if (this.get(File.I_F_QUALIF).expected && this.get(File.I_F_TITLE).expected == this.get(File.I_F_QUALIF).expected) {
            // 'remove duplicate title/original'
            this.get(File.I_F_QUALIF).expect('', 'Original is a duplicate of the title');
        }

        return this;
    }

    /**
     * Check if all informationas are consistent
     *
     * @protected
     *
     * @returns {File} this
     */
    prepare() {
        return this;
    }

    /**
     * Do the act based on .values
     *
     * If implemented by sub parts, call this parent at the latest
     *
     * @protected
     *
     * @returns {Promise<File>} when finished
     */
    async fix() {
        if (this.get(File.I_FILENAME).expected == null || this.get(File.I_EXTENSION).expected == null) {
            await fileDeleteAndRelease(this);
        } else {
            await fileRename(this);
        }

        return this;
    }

    // ------------------------------------------
    //
    // Private methods
    //
    // ------------------------------------------

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
     * @returns {boolean} true if the file is consistent
     */
    runPrepare() {
        if (this.get(File.I_FILENAME).expected == null) {
            // The file will be deleted anyway
            this.notify(STATUS_NEED_ACTION);
            return false;
        }

        try {
            this.prepare();

            // Look for problems
            if (this.problemsList.length > 0) {
                this.notify(STATUS_FAILURE);
                throw new FOError(this.problemsList.length + ' problem(s) found: ' + this.problemsList.join(' / '));
            }

            // Look at all values, and if some are note ok
            // it means we have stuff to do
            const unsolvedValuesKeys = Object.keys(this.values)
                .filter(k => !this.values[k].isDone());

            if (unsolvedValuesKeys.length > 0) {
                this.notify(STATUS_NEED_ACTION);
                // throw new FOError(unsolvedValuesKeys.length + ' unsolved value(s) found: '
                //     + unsolvedValuesKeys.map(k => `${k} (${this.get(k).current} <-> ${this.get(k).expected})`)
                // );
                return false;
            }

            // Cool, this is done
            this.notify(STATUS_SUCCESS);
            return true;
        } catch (e) {
            this.notify(STATUS_FAILURE);
            throw e;
        }
    }

    /**
     * Do the real transformation
     *
     * @returns {Promise<void>} when finished
     */
    async runFix() {
        if (this.status == STATUS_SUCCESS) {
            return;
        }
        if (this.status != STATUS_NEED_ACTION) {
            throw new FOError('In invalid state: ' + this.status);
        }
        this.notify(STATUS_ACTING);

        try {
            await this.fix();

            if (this.get(File.I_FILENAME).current == null) {
                // The file will be deleted anyway
                this.notify(STATUS_ACTED_SUCCESS);
                return;
            }

            const unsolved = Object.entries(this.values) // [ key, value ]
                .filter(e => !e[1].isDone())
                .map(e => e[0] + `(${JSON.stringify(e[1].expected)} vs ${JSON.stringify(e[1].current)})`);

            if (unsolved.length > 0) {
                throw new FOError('Information not solved: ' + unsolved.join(', '));
            }

            this.notify(STATUS_ACTED_SUCCESS);
        } catch (e) {
            // TODO: handle error
            this.error = e;
            this.notify(STATUS_ACTED_FAILURE);
            throw e;
        }
    }

    /**
     * Get a description of all actions taken
     *
     * @returns {string[]} the list of problems
     */
    getActionsList() {
        const list = [];

        // TODO: filter is not working
        list.push(...Object.keys(this.values)
            .filter(k => this.values[k].isModified())
            .map(k => `${k} (${this.get(k).initial} -> ${this.get(k).expected}) ${this.get(k).messages.join(' / ')}`)
        );

        return list;
    }

    /**
     * Get the list of detected problems
     * based on problems and values
     *
     * @returns {string[]} the list of problems
     */
    getProblemsList() {
        const list = [];
        list.push(...this.problemsList);

        list.push(...Object.keys(this.values)
            .filter(k => !this.values[k].isDone())
            .map(k => `${k} (${this.get(k).current} <-> ${this.get(k).expected})`)
        );

        return list;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            initialPath: this.initialPath,
            currentFilePath: this.currentFilePath
        };
    }
}

registerRegExp(FallBackRegExp, File, { forFiles: true, forFolders: true });
