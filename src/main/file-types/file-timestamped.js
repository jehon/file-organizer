
// import path from 'path';

import File from './file.js';
// import options from '../../../file-organizer/options.js';

// import fileUtils from '../../../file-organizer/file-utils.js';
// import timestampAPI from '../../../file-organizer/timestamp.js';
// const { tsFromString } = timestampAPI;

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

        if (this.get(File.I_FN_TITLE).expected && this.get(File.I_FN_TITLE).expected == this.get(File.I_FN_QUALIF).expected) {
            // 'remove duplicate title/original'
            this.get(File.I_FN_QUALIF).expect('', 'Original is a duplicate of the title');
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

        //
        // Coherence tests
        //

        if (!this.get(File.I_FN_TIME).expected) {
            this.addProblem(FileTimestamped.P_NO_TITLE);
        }

        if (!this.get(File.I_FN_TIME).expected.isTimestamped()) {
            this.addProblem(FileTimestamped.P_NO_TIMESTAMP);
        } else {
            // Check filename according to parent folder TS

            // TODO(legacy): wait for folder to be migrated
            if (this.parent && this.parent.get(File.I_FN_TIME)) {
                if (this.parent.get(File.I_FN_TIME).expected.isTimestamped()
                    || this.parent.get(File.I_FN_TIME).expected.isRange()) {
                    if (!this.get(File.I_FN_TIME).expected.matchLithe(this.parent.get(File.I_FN_TIME).expected)) {
                        this.addProblem(FileTimestamped.P_TS_INCOHERENT);
                    }
                }
            }
        }
    }

    getCanonicalFilename() {
        let proposedFilename = '';
        if (this.get(File.I_FN_TIME).expected.humanReadable() > '') {
            proposedFilename += this.get(File.I_FN_TIME).expected.humanReadable();
        }
        if (this.get(File.I_FN_TITLE).expected > '') {
            proposedFilename += ' ' + this.get(File.I_FN_TITLE).expected;
        }
        if (this.get(File.I_FN_QUALIF).current + '' > '') {
            proposedFilename += ' [' + this.get(File.I_FN_QUALIF).current + ']';
        }
        return proposedFilename.trim();
    }
}
