
import File from './file.js';
import options from '../../common/options.js';
import Value from '../value.js';
import { isRange, timestampMatchLithe } from '../time-helpers.js';

export default class FileTimed extends File {
    static I_FT_TIME = 'FileTimed_time'
    static I_FT_TITLE = 'FileTimed_title'

    static P_TS_NOT_PARSABLE = 'Filename is not parsable'
    static P_NO_TIMESTAMP = 'No timestamp found'
    static P_NO_TITLE = 'No title found'
    static P_TS_INCOHERENT = 'Incoherent with parent folder'

    /**
     * This function is abstract in a way that it can not get infos from the inside
     * per it-self, it must be extended.
     *
     * @see File#loadData()
     *
     * @param {string} ts from internal file (to set the initial value)
     * @param {string} title from internal file (to set the initial value)
     *
     * @returns {Promise<FileTimed>} this
     */
    async loadData(ts = '', title = '') {
        await super.loadData();

        this.set(FileTimed.I_FT_TIME, new Value(ts));
        this.set(FileTimed.I_FT_TITLE, new Value(title));

        this.get(FileTimed.I_FT_TIME).onExpectedChanged(v => this.get(File.I_F_TIME).expect(v.expected));
        this.get(FileTimed.I_FT_TITLE).onExpectedChanged(v => this.get(File.I_F_TITLE).expect(v.expected));

        return this;
    }

    prepare() {
        /*
         * Let's go with calculations
         */

        // TODO(timestamp): this should dissapear

        if (this.get(File.I_F_TIME).initial.type == 'invalid') {
            this.addProblem(FileTimed.P_TS_NOT_PARSABLE);
            return this;
        }

        /**********************************
         * Adapt to options !
         */

        // --------------------
        // Title
        //

        if (options.setTitle) {
            this.get(FileTimed.I_FT_TITLE).expect(options.setTitle, 'from options');
        }

        if (options.forceTitleFromFolder) {
            // We take the initial value, which is the one at startup time
            this.get(FileTimed.I_FT_TITLE).expect(this.parent.get(File.I_F_TITLE).initial);
        }

        if (options.forceTitleFromFilename) {
            // We take the initial value, which is the one at startup time
            this.get(FileTimed.I_FT_TITLE).expect(this.get(FileTimed.I_F_TITLE).initial);
        }

        // --------------------
        // Timestamp
        //

        if (options.forceTimestampFromFilename) {
            // We take the initial value, which is the one at startup time
            this.get(FileTimed.I_FT_TIME).expect(this.get(FileTimed.I_F_TIME).initial);
        }

        /************************************
         * Set missing values
         */

        if (!this.get(FileTimed.I_FT_TITLE).expected) {
            this.get(FileTimed.I_FT_TITLE).expect(this.get(File.I_F_TITLE).current, 'guessing the title from the filename');
        }

        if (!this.get(FileTimed.I_FT_TITLE).expected) {
            this.get(FileTimed.I_FT_TITLE).expect(this.parent.get(File.I_F_TITLE).current, 'guessing the title from the parent folder');
        }

        if (!this.get(FileTimed.I_FT_TIME).expected) {
            this.get(FileTimed.I_FT_TIME).expect(this.get(File.I_F_TIME).current, 'guessing the timestamp from the filename');
        }

        /***************************************
         * Raise problems
         */

        if (!this.get(File.I_F_TIME).expected) {
            this.addProblem(FileTimed.P_NO_TIMESTAMP);
        }

        if (!this.get(File.I_F_TITLE).expected) {
            this.addProblem(FileTimed.P_NO_TITLE);
        }

        if (!this.get(File.I_F_TIME).expected) {
            this.addProblem(FileTimed.P_NO_TIMESTAMP);
        } else {
            // Check filename according to parent folder TS
            // TODO: look recursively for parent to parent
            // TODO: check that folders are ok too => move this to file ?
            // if (this.parent && this.parent.get(File.I_F_TIME).expected) {
            if (this.parent && this.parent.get(File.I_F_TIME).expected
                || isRange(this.parent.get(File.I_F_TIME).expected)) {

                if (!timestampMatchLithe(this.get(File.I_F_TIME).expected, this.parent.get(File.I_F_TIME).expected)) {
                    this.addProblem(FileTimed.P_TS_INCOHERENT);
                }
            }
        }

        return this;
    }
}
