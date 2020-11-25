
import File from './file.js';
import { fileDelete } from '../tasks-fs.js';
import { registerRegExp, glob2regExp } from '../register-file-types.js';

export default class FileDelete extends File {
    async analyse() {
        return super.analyse()
            .then(() => {
                this.get(File.I_FILENAME).expected = null;
                this.get(File.I_EXTENSION).expected = null;
            });
    }

    async act() {
        return fileDelete(this)
            .then(() => {
                this.get(File.I_FILENAME).fix();
                this.get(File.I_EXTENSION).fix();
            })
            .then(() => super.act());
    }
}

registerRegExp([
    glob2regExp('Thumbs.db'),
    glob2regExp('.picasa.ini')
], FileDelete, { forFiles: true, forFolders: true });
