
import path from 'path';

import File from './file.js';
import options from '../../../file-organizer/options.js';

import fileUtils from '../../../file-organizer/file-utils.js';
import timestampAPI from '../../../file-organizer/timestamp.js';
const { tsFromString } = timestampAPI;

import ValueCalculated from '../value-calculated.js';

import pLimit from 'p-limit'; // https://www.npmjs.com/package/p-limit
const indexedFilenameLimiter = pLimit(1);

export default class FileTimestamped extends File {
    static I_FTS_TITLE = 'filename_ts_title';
    static I_FTS_ORIGINAL = 'filename_ts_original';
    static I_FTS_TIME = 'filename_ts_time';

    static P_TS_NOT_PARSABLE = 'Filename is not parsable'

    async analyse() {
        await super.analyse();

        /* Build up all informations and link them to I_FILENAME */

        const vFn = this.get(File.I_FILENAME);
        const parsedTS = tsFromString(vFn);

        /* auto update filename  */
        const updateFn = () => this.get(File.I_FILENAME).expected(this.getCanonicalFilename());

        this.set(FileTimestamped.I_FTS_ORIGINAL,
            new ValueCalculated(vFn, fn => tsFromString(fn).original)
                .onExpectedChanged(updateFn)
        );

        this.set(FileTimestamped.I_FTS_TITLE,
            new ValueCalculated(vFn, fn => tsFromString(fn).title)
                .onExpectedChanged(updateFn)
        );

        // TODO: this should be a date...
        this.set(FileTimestamped.I_FTS_TIME,
            new ValueCalculated(vFn, fn => tsFromString(fn))
                .onExpectedChanged(updateFn)
        );


        /*
         * Let's go with calculations
         */

        // Parse the original filename to see if we can get some data
        if (this.get(FileTimestamped.I_FTS_ORIGINAL).current) {
            const ts2 = tsFromString(this.get(FileTimestamped.I_FTS_ORIGINAL).current);
            if (ts2.isTimestamped()) {
                this.get(FileTimestamped.I_FTS_TIME).expect(ts2);
            }
        }

        // if (this.calculatedTS.type == 'invalid') {
        //     this.addProblem(FileTimestamped.P_TS_NOT_PARSABLE);
        //     return;
        // }

        // let res = true;
        // if (this.calculatedTS.title && this.calculatedTS.title == this.calculatedTS.original) {
        //     this.addMessageInfo('TS_DUP_TITLE', 'remove duplicate title/original',
        //         'remove original filename'
        //     );
        //     this.calculatedTS.original = '';
        // }

        // {
        //     if (options.setTitle && this.calculatedTS.title != options.setTitle) {
        //         this.addMessageInfo('TS_TITLE_OPTION_SET', 'force the title as requested on command line',
        //             options.setTitle
        //         );
        //         this.setCalculatedTitle(options.setTitle);
        //     }
        //     if (options.forceTitleFromFilename && this.calculatedTS.title != this.get(FileTimestamped.I_TS_FILENAME.title) {
        //         this.addMessageInfo('TS_TITLE_OPTION_FILENAME', 'force the title from the filename',
        //             this.get(FileTimestamped.I_TS_FILENAME.title
        //             );
        //         this.setCalculatedTitle(this.get(FileTimestamped.I_TS_FILENAME.title);
        //     }
        //     if (options.forceTitleFromFolder && this.calculatedTS.title != this.parent.filenameTS.title) {
        //         this.addMessageInfo('TS_TITLE_OPTION_FOLDER', 'force the title from the parent folder',
        //             this.parent.filenameTS.title
        //         );
        //         this.setCalculatedTitle(this.parent.filenameTS.title);
        //     }

        //     if (!this.calculatedTS.title && this.get(FileTimestamped.I_TS_FILENAME.title && this.calculatedTS.title != this.get(FileTimestamped.I_TS_FILENAME.title) {
        //         this.addMessageInfo('TS_TITLE_FILENAME', 'set the title from the filename',
        //             this.get(FileTimestamped.I_TS_FILENAME.title
        //             );
        //         this.setCalculatedTitle(this.get(FileTimestamped.I_TS_FILENAME.title);
        //     }
        //     if (!this.calculatedTS.title && this.parent.filenameTS.title && this.calculatedTS.title != this.parent.filenameTS.title) {
        //             this.addMessageInfo('TS_TITLE_FOLDER', 'set the title from the parent folder',
        //                 this.parent.filenameTS.title
        //             );
        //             this.setCalculatedTitle(this.parent.filenameTS.title);
        //         }
        // }

        // {
        //     if (options.forceTimestampFromFilename && this.calculatedTS.humanReadable() != this.get(FileTimestamped.I_TS_FILENAME.humanReadable()) {
        //         this.addMessageInfo('TS_TIMESTAMP_FORCE', 'Updating timestamp',
        //             this.get(FileTimestamped.I_TS_FILENAME.humanReadable()
        //             );
        //         this.setCalculatedTS(this.get(FileTimestamped.I_TS_FILENAME);
        //     }
        // }

        // if (!this.calculatedTS.title) {
        //     res = res && this.addMessageImpossible('TS_NO_TITLE', 'No title found');
        // }

        // if (!this.calculatedTS.isTimestamped()) {
        //     res = res && this.addMessageImpossible('TS_NO_TIMESTAMP', 'No timestamp found');
        // } else {
        //     // Check filename according to parent folder TS
        //     if (this.parent.calculatedTS.isTimestamped()) {
        //         if (!this.calculatedTS.matchLithe(this.parent.calculatedTS)) {
        //             res = res && this.addMessageImpossible('TS_PARENT_INCOHERENT',
        //                 `calculated timestamp incoherent to parent folder (${this.calculatedTS.humanReadable()} / ${this.parent.calculatedTS.humanReadable()})`
        //             );
        //         }
        //     }
        // }

        // if (!res) {
        //     return res;
        // }

        // if (!await super.check()) {
        //     return false;
        // }

        // {
        //     // TODO(indexed): did not work???

        //     // Rename to the canonical filename
        //     // const proposedFilename = await this.getIndexedFilename();
        //     const proposedFilename = this.getCanonicalFilename();
        //     if (proposedFilename != this.get('filename').initial) {
        //         res = res && await this.addMessageCommit('TS_CANONIZE', 'canonize filename',
        //             proposedFilename,
        //             () => this.changeFilename(proposedFilename)
        //         );
        //     }
        // }

        // return res;
    }

    setCalculatedTitle(newC) {
        this.calculatedTS.title = newC;
        return true;
    }

    setCalculatedTS(newTS) {
        if (typeof newTS == 'string') {
            newTS = tsFromString(newTS);
        }

        if (newTS.isTimestamped()) {
            this.calculatedTS.moment = newTS.moment.clone();
        } else {
            this.calculatedTS.moment = null;
        }

        return true;
    }

    getCanonicalFilename() {
        let proposedFilename = '';
        if (this.get(FileTimestamped.I_FTS_TIME).expected.humanReadable() > '') {
            proposedFilename += this.get(FileTimestamped.I_FTS_TIME).expected.humanReadable();
        }
        if (this.get(FileTimestamped.I_FTS_TITLE).expected > '') {
            proposedFilename += ' ' + this.get(FileTimestamped.I_FTS_TITLE).expected;
        }
        if (this.get(FileTimestamped.I_FTS_ORIGINAL).current + '' > '') {
            proposedFilename += ' [' + this.get(FileTimestamped.I_FTS_ORIGINAL).current + ']';
        }
        return proposedFilename.trim();
    }

    // // TODO (indexed): remember names to // rename
    // // @Limited(1)
    // async getIndexedFilename() {
    //     const o = this.calculatedTS.original;
    //     if (/^\d+$/.test(o)) {
    //         // Remove previous index (numerical)
    //         this.calculatedTS.original = '';
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

    //         this.calculatedTS.original = 1;
    //         while (this.calculatedTS.original != o) {
    //             try {
    //                 await fileUtils.checkAndReserveName(p(this.getCanonicalFilename()), this.currentFilePath);
    //                 return this.getCanonicalFilename();
    //             } catch (_e) {
    //                 //expected
    //             }
    //             this.calculatedTS.original++;
    //         }
    //     });
    // }
}
