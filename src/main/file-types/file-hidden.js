
import File from './file.js';
import { registerRegExp, glob2regExp } from '../register-file-types.js';

export default class FileHidden extends File {
    async loadData() {
        // Nothing to be done on an Hidden File
        return this;
    }

    async fix() {
        // Nothing to be done on an Hidden File
        return this;
    }
}

registerRegExp([
    glob2regExp('#recycle'),
    glob2regExp('@eaDir'),
    glob2regExp('.*'),
], FileHidden);

registerRegExp(/^[^.]+$/i, FileHidden, { forFiles: true, forFolders: false });
