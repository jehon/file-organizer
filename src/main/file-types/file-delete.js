
import File from './file.js';
import { TaskFileDelete } from '../tasks-fs.js';
import { registerRegExp, glob2regExp } from '../register-file-types.js';

export default class FileDelete extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.analysisAddFixAct(new TaskFileDelete()))
            .then(() => { });
    }
}

registerRegExp([
    glob2regExp('Thumbs.db'),
    glob2regExp('.picasa.ini')
], FileDelete, { forFiles: true, forFolders: true });
