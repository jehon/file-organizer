
const path = require('path');

const fileUtils = require('./file-utils');

const FileGeneric = require('./file-generic.js');
const { tsFromString } = require('./timestamp.js');
const options = require('./options.js');

const pLimit = require('p-limit'); // https://www.npmjs.com/package/p-limit
const indexedFilenameLimiter = pLimit(1);

class FileTimestamped extends FileGeneric {
    constructor(filePath, parent = null) {
        super(filePath, parent);

        this.filenameTS = tsFromString(this.getFilename());
        const title = this.filenameTS.title;

        // Parse the original filename to see if we can get some data
        if (this.filenameTS.original) {
            const ts2 = tsFromString(this.filenameTS.original);
            if (ts2.isTimestamped() > 0) {
                this.filenameTS = ts2;
            }
        }
        this.filenameTS.title = title;
        this.calculatedTS = this.filenameTS.clone();
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
        if (this.calculatedTS.humanReadable() > '') {
            proposedFilename += this.calculatedTS.humanReadable();
        }
        if (this.calculatedTS.title > '') {
            proposedFilename += ' ' + this.calculatedTS.title;
        }
        if (this.calculatedTS.original + '' > '') {
            proposedFilename +=  ' [' + this.calculatedTS.original + ']';
        }
        return proposedFilename.trim();
    }

    // TODO (indexed): remember names to // rename
    // @Limited(1)
    async getIndexedFilename() {
        const o = this.calculatedTS.original;
        if (/^\d+$/.test(o)) {
            // Remove previous index (numerical)
            this.calculatedTS.original = '';
        }

        if (this.getCanonicalFilename() == this.getFilename()) {
            return this.getCanonicalFilename();
        }

        const p = (proposedFilename) => path.join(this.parent.getPath(), proposedFilename + this.getExtension());

        return indexedFilenameLimiter(async () => {
            try {
                await fileUtils.checkAndReserveName(p(this.getCanonicalFilename()), this.getPath());
                return this.getCanonicalFilename();
            } catch (_e) {
                // expected
            }

            this.calculatedTS.original = 1;
            while(this.calculatedTS.original != o) {
                try {
                    await fileUtils.checkAndReserveName(p(this.getCanonicalFilename()), this.getPath());
                    return this.getCanonicalFilename();
                } catch(_e) {
                    //expected
                }
                this.calculatedTS.original++;
            }
        });
    }

    async check() {
        if (this.calculatedTS.type == 'invalid') {
            return this.addMessageImpossible('TS_FILENAME_INVALID', 'filename is not parsable');
        }

        let res = true;
        if (this.calculatedTS.title && this.calculatedTS.title == this.calculatedTS.original) {
            this.addMessageInfo('TS_DUP_TITLE', 'remove duplicate title/original',
                'remove original filename'
            );
            this.calculatedTS.original = '';
        }

        {
            if (options.setTitle  && this.calculatedTS.title != options.setTitle) {
                this.addMessageInfo('TS_TITLE_OPTION_SET', 'force the title as requested on command line',
                    options.setTitle
                );
                this.setCalculatedTitle(options.setTitle);
            }
            if (options.forceTitleFromFilename && this.calculatedTS.title != this.filenameTS.title) {
                this.addMessageInfo('TS_TITLE_OPTION_FILENAME', 'force the title from the filename',
                    this.filenameTS.title
                );
                this.setCalculatedTitle(this.filenameTS.title);
            }
            if (options.forceTitleFromFolder && this.calculatedTS.title != this.parent.filenameTS.title) {
                this.addMessageInfo('TS_TITLE_OPTION_FOLDER', 'force the title from the parent folder',
                    this.parent.filenameTS.title
                );
                this.setCalculatedTitle(this.parent.filenameTS.title);
            }

            if (!this.calculatedTS.title && this.filenameTS.title && this.calculatedTS.title != this.filenameTS.title) {
                this.addMessageInfo('TS_TITLE_FILENAME', 'set the title from the filename',
                    this.filenameTS.title
                );
                this.setCalculatedTitle(this.filenameTS.title);
            }
            if (!this.calculatedTS.title && this.parent.filenameTS.title && this.calculatedTS.title != this.parent.filenameTS.title) {
                this.addMessageInfo('TS_TITLE_FOLDER', 'set the title from the parent folder',
                    this.parent.filenameTS.title
                );
                this.setCalculatedTitle(this.parent.filenameTS.title);
            }
        }

        {
            if (options.forceTimestampFromFilename && this.calculatedTS.humanReadable() != this.filenameTS.humanReadable()) {
                this.addMessageInfo('TS_TIMESTAMP_FORCE', 'Updating timestamp',
                    this.filenameTS.humanReadable()
                );
                this.setCalculatedTS(this.filenameTS);
            }
        }

        if (!this.calculatedTS.title) {
            res = res && this.addMessageImpossible('TS_NO_TITLE', 'No title found');
        }

        if (!this.calculatedTS.isTimestamped()) {
            res = res && this.addMessageImpossible('TS_NO_TIMESTAMP', 'No timestamp found');
        } else {
            // Check filename according to parent folder TS
            if (this.parent.calculatedTS.isTimestamped()) {
                if (!this.calculatedTS.matchLithe(this.parent.calculatedTS)) {
                    res = res && this.addMessageImpossible('TS_PARENT_INCOHERENT',
                        `calculated timestamp incoherent to parent folder (${this.calculatedTS.humanReadable()} / ${this.parent.calculatedTS.humanReadable()})`
                    );
                }
            }
        }

        if (!res) {
            return res;
        }

        if (!await super.check()) {
            return false;
        }

        {
            // TODO(indexed): did not work???

            // Rename to the canonical filename
            // const proposedFilename = await this.getIndexedFilename();
            const proposedFilename = this.getCanonicalFilename();
            if (proposedFilename != this.getFilename()) {
                res = res && await this.addMessageCommit('TS_CANONIZE', 'canonize filename',
                    proposedFilename,
                    () => this.changeFilename(proposedFilename)
                );
            }
        }

        return res;
    }
}

module.exports = FileTimestamped;
