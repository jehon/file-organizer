
import File from './file.js';
import { registerRegExp, glob2regExp } from '../register-file-types.js';

export default class FileDelete extends File {
    async loadData() {
        await super.loadData();

        // By setting any one of these to null
        // the file will be deleted
        this.get(File.I_FILENAME).expect(null, 'file is deleted');

        return this;
    }
}

registerRegExp([
    glob2regExp('Thumbs.db'),
    glob2regExp('.picasa.ini')
], FileDelete, { forFiles: true, forFolders: true });
