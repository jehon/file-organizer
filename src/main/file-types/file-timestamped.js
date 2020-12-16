
import File from './file.js';
import options from '../../../file-organizer/options.js';
import Value from '../value.js';

export default class FileTimestamped extends File {
    static I_ITS_TIME = 'FileTimestamped_time'
    static I_ITS_TITLE = 'FileTimestamped_title'

    static P_TS_NOT_PARSABLE = 'Filename is not parsable'
    static P_NO_TIMESTAMP = 'No timestamp found'
    static P_NO_TITLE = 'No title found'
    static P_TS_INCOHERENT = 'Incoherent with parent folder'

    /**
     * Read the internal data
     *
     * @abstract
     *
     * @returns {Promise<object>} with the data
     * @property {module:file-organizer/Timestamp} ts is the timestamp
     * @property {string} title the title
     */
    async readInternalData() {
        // Default value are simply taken from filename
        return {
            ts: this.get(File.I_FN_TIME).expected,
            title: this.get(File.I_FN_TITLE).expected
        };
    }

    async analyse() {
        await super.analyse();

        const d = await this.readInternalData();

        this.set(FileTimestamped.I_ITS_TIME, new Value(d.ts));
        this.set(FileTimestamped.I_ITS_TITLE, new Value(d.title));

        this.get(FileTimestamped.I_ITS_TIME).onExpectedChanged(v => this.get(File.I_FN_TIME).expect(v.expected));
        this.get(FileTimestamped.I_ITS_TITLE).onExpectedChanged(v => this.get(File.I_FN_TITLE).expect(v.expected));

        /*
         * Let's go with calculations
         */

        if (this.get(File.I_FN_TIME).initial.type == 'invalid') {
            this.addProblem(FileTimestamped.P_TS_NOT_PARSABLE);
            return;
        }

        /**********************************
         * Adapt to options !
         */

        // --------------------
        // Title
        //

        if (options.setTitle) {
            this.get(FileTimestamped.I_ITS_TITLE).expect(options.setTitle, 'from options');
        }

        if (options.forceTitleFromFolder) {
            // We take the initial value, which is the one at startup time
            this.get(FileTimestamped.I_ITS_TITLE).expect(this.parent.get(File.I_FN_TITLE).initial);
        }

        if (options.forceTitleFromFilename) {
            // We take the initial value, which is the one at startup time
            this.get(FileTimestamped.I_ITS_TITLE).expect(this.get(FileTimestamped.I_FN_TITLE).initial);
        }

        // --------------------
        // Timestamp
        //

        if (options.forceTimestampFromFilename) {
            // We take the initial value, which is the one at startup time
            this.get(FileTimestamped.I_ITS_TIME).expect(this.get(FileTimestamped.I_FN_TIME).initial);
        }

        /************************************
         * Set missing values
         */
        if (!this.get(FileTimestamped.I_ITS_TITLE).expected) {
            this.get(FileTimestamped.I_ITS_TITLE).expect(this.get(File.I_FN_TITLE).current, 'guessing the title from the filename');
        }

        if (!this.get(FileTimestamped.I_ITS_TITLE).expected) {
            this.get(FileTimestamped.I_ITS_TITLE).expect(this.parent.get(File.I_FN_TITLE).current, 'guessing the title from the parent folder');
        }
    }

    checkConsistency() {
        if (!this.get(File.I_FN_TIME).expected) {
            this.addProblem(FileTimestamped.P_NO_TIMESTAMP);
        }

        if (!this.get(File.I_FN_TITLE).expected) {
            this.addProblem(FileTimestamped.P_NO_TITLE);
        }

        if (!this.get(File.I_FN_TIME).expected.isTimestamped()) {
            this.addProblem(FileTimestamped.P_NO_TIMESTAMP);
        } else {
            // Check filename according to parent folder TS

            // TODO(legacy): wait for folder to be migrated
            // TODO: look upto "root" (concept to be defined)
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
}
