
// import path from 'path';

import File from './file.js';
// import options from '../../../file-organizer/options.js';

// import fileUtils from '../../../file-organizer/file-utils.js';
import timestampAPI from '../../../file-organizer/timestamp.js';
const { tsFromString } = timestampAPI;

// import pLimit from 'p-limit'; // https://www.npmjs.com/package/p-limit
// const indexedFilenameLimiter = pLimit(1);

export default class FileTimestamped extends File {
    static P_TS_NOT_PARSABLE = 'Filename is not parsable'
    static P_NO_TIMESTAMP = 'No timestamp found'
    static P_NO_TITLE = 'No title found'
    static P_TS_INCOHERENT = 'Incoherent with parent folder'

    async analyse() {
        await super.analyse();

        /*
         * Let's go with calculations
         */

        if (this.get(File.I_FN_TIME).current.type == 'invalid') {
            this.addProblem(FileTimestamped.P_TS_NOT_PARSABLE);
            return;
        }

        if (this.get(File.I_FN_TITLE).expected && this.get(File.I_FN_TITLE).expected == this.get(File.I_FN_ORIGINAL).expected) {
            // 'remove duplicate title/original'
            this.get(File.I_FN_ORIGINAL).expect('');
        }

        //
        // Adapt to options !
        //

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

    // setCalculatedTitle(newC) {
    //     this.calculatedTS.title = newC;
    //     return true;
    // }

    // setCalculatedTS(newTS) {
    //     if (typeof newTS == 'string') {
    //         newTS = tsFromString(newTS);
    //     }

    //     if (newTS.isTimestamped()) {
    //         this.calculatedTS.moment = newTS.moment.clone();
    //     } else {
    //         this.calculatedTS.moment = null;
    //     }

    //     return true;
    // }

    getCanonicalFilename() {
        let proposedFilename = '';
        if (this.get(File.I_FN_TIME).expected.humanReadable() > '') {
            proposedFilename += this.get(File.I_FN_TIME).expected.humanReadable();
        }
        if (this.get(File.I_FN_TITLE).expected > '') {
            proposedFilename += ' ' + this.get(File.I_FN_TITLE).expected;
        }
        if (this.get(File.I_FN_ORIGINAL).current + '' > '') {
            proposedFilename += ' [' + this.get(File.I_FN_ORIGINAL).current + ']';
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
