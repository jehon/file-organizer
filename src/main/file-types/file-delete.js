
import File from './file.js';
import { TaskFileDelete } from '../tasks-fs.js';
import { registerGlob } from '../register-file-types.js';

export default class FileDelete extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.addFixAct(new TaskFileDelete()))
            .then(() => { });
    }
}

registerGlob([
    'Thumbs.db',
    '.picasa.ini'
], FileDelete);
