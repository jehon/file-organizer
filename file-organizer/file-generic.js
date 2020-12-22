
const path = require('path');

const chalk = require('chalk');

const messages = require('./messages.js');
const fileUtils = require('./file-utils.js');
const options = require('./options.js');

const pLimit = require('p-limit'); // https://www.npmjs.com/package/p-limit
const renameLimiter = pLimit(1);

const activeFilesList = new Map();

let id = 0;

const parents = new Map();

class FileGeneric {
    constructor(filePath, parent = null) {
        this._id = id++;
        this._path = fileUtils.getAbsolutePath(filePath);
        if (this._parent && this._parent.getPath() != '.') {
            this._parent = parent;
        }
        this._infos = {};
        this._originalFilePath = filePath;

        this.generic_original_extension = this.getExtension();

        this.stats = {
            fixed: 0,
            skipped: 0,
            errors: 0
        };

        activeFilesList.set(this._id, this);
        messages.statsAddFileToTotal();
        messages.statsSetPendingFiles(activeFilesList.size);
        this.messages = new Map();
    }

    end() {
        if (activeFilesList.has(this._id)) {
            activeFilesList.delete(this._id);
        }
        if (options.withFileSummary) {
            if (this.messages.size > 0) {
                process.stdout.write(
                    '*** '
                    + fileUtils.getPathRelativeTo(this.parent.getPath()) + '/' + chalk.bold(this.getFilename()) + this.getExtension()
                    + (this._originalFilePath != this.getPath() ? '\n  < ' + fileUtils.getPathRelativeTo(this._originalFilePath) : '')
                    + Array.from(this.messages.entries())
                        .map(v => v[1])
                        .map(v => '\n  ' + v)
                        .reduce((prev, cur) => prev += cur, '')
                    + '\n'
                );
            }
            this.messages = new Map();
        }
        messages.statsSetPendingFiles(activeFilesList.size);
    }

    /**
     * @param {string} code
     * @param {string} description free text
     * @param {string} newInfo the new information (display only)
     * @param {null | boolean | Function} icon
     * null: action errors (impossible)
     * true: info message of success
     * fn: fix function
     */
    addMessage(code, description, newInfo = null, icon = null) {
        this.messages.set(code, icon
            + (description ? ' ' + chalk.yellow((description).padEnd(40, ' ')) : '')
            + (newInfo ? ' ' + chalk.blue('' + newInfo) : '')
        );
    }

    addMessageImpossible(code, description) {
        this.stats.errors++;
        messages.statsAddErrorToTotal();
        this.addMessage(code, description, null, messages.IconFailure);
        return false;
    }

    addMessageInfo(code, description, newInfo = null) {
        this.addMessage(code, description, newInfo, messages.IconSuccess);
        return true;
    }

    async addMessageCommit(code, description, newInfo = null, action = null) {
        let res = false;
        let msg = messages.IconSkipped;

        if (options.dryRun) {
            this.stats.fixSkipped++;
            messages.statsAddSkippedFix();
        } else {
            try {
                res = await action();

                if (res === undefined) {
                    res = true;
                }
                if (res) {
                    msg = messages.IconSuccess;
                    this.stats.fixed++;
                    messages.statsAddFixToTotal();
                } else {
                    msg = messages.IconFailure;
                    this.stats.errors++;
                    messages.statsAddErrorToTotal();
                }
            } catch (e) {
                messages.notifyError(e);
                this.stats.errors++;
                messages.statsAddErrorToTotal();
                res = false;
            }
        }
        this.addMessage(code, description, newInfo, msg);
        return res;
    }

    // TODO: to be tested
    async addMessageConvert(code, targetExtension, action) {
        const sourcePath = this.getPath();
        const targetPath = path.join(fileUtils.getDirname(this.getPath()), this.getFilename() + targetExtension);
        const convertedPath = path.join(fileUtils.getDirname(this.getPath()), this.getFilename() + FileGeneric.convertedSuffix + this.getExtension());

        let res = await messages.addMessageCommit(code + '_CONVERT', 'Convert file', targetExtension, async () => action(sourcePath, targetPath));
        if (res) {
            res = res && await messages.addMessageCommit(code + '_OBSOLETE', 'Move away original file', fileUtils.getFilename(convertedPath),
                () => fileUtils.fileRename(this.getPath(), convertedPath)
            );
        }
        return res;
    }

    get parent() {
        // TODO(optimization): build a parent cache?
        if (this._parent == null) {
            let parentDir = path.dirname(this.getPath());
            if (parentDir == '/') {
                return null;
            }
            if (!parents.has(parentDir)) {
                const FileFolder = require('./file-folder.js');
                const p = new FileFolder(parentDir);
                p.end();
                parents.set(parentDir, p);
            }
            this._parent = parents.get(parentDir);
        }
        return this._parent;
    }

    getPath() {
        return this._path;
    }

    /**
     * Without extension
     */
    getFilename() {
        return fileUtils.getFilename(this.getPath());
    }

    /**
     * Format: .blabla
     */
    getExtension() {
        return fileUtils.getExtension(this.getPath());
    }

    async loadData() {
        return this;
    }

    async changeFilename(newFilename) {
        return this.rename(newFilename + this.getExtension());
    }

    // TODO (indexed): //ise it
    // @Limited(1)
    async rename(newFilenameWithExtension) {
        const newPath = path.join(this.parent.getPath(), newFilenameWithExtension);
        if (this.getPath() == newPath) {
            return true;
        }

        // Only one at at time...
        return renameLimiter(async () => {
            await fileUtils.fileRename(
                this.getPath(),
                newPath
            );
            this._path = newPath;
            return true;
        });
    }

    async remove() {
        return fileUtils.fileDelete(this.getPath());
    }

    async iterate(apply) {
        return Promise.resolve(this)
            .then(() => apply(this))
            .catch(e => this.addMessageImpossible('ERR', 'Error: ' + (e instanceof Error ? e.message : e)))
            .finally(() => this.end());
    }

    async check() {
        let res = true;
        {
            // Lowercase extension
            if (this.getExtension().toLowerCase() != this.getExtension()) {
                let proposedFN = this.getFilename() + this.getExtension().toLowerCase();
                res = res && await this.addMessageCommit('FILE_EXT_UPPERCASE', 'uppercase extension',
                    proposedFN,
                    () => this.rename(proposedFN)
                );
            }
        }

        return res;
    }
}

module.exports = FileGeneric;
FileGeneric.convertedSuffix = '_converted';
FileGeneric.pendings = activeFilesList;

FileGeneric.init = async function () {
    await import('../src/main/register-file-types.js').then(({ registerRegExp, glob2regExp }) => {
        registerRegExp([
            glob2regExp('*.pdf'),
            glob2regExp('*.txt')
        ], FileGeneric, { forFiles: true });
    });
};