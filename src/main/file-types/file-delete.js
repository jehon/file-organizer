
import File from '../../../file-organizer/main/file.js';
// import {
//     TaskFileDelete
// } from '../../../file-organizer/main/tasks-fs.js';
import TasksFSApi from '../../../file-organizer/main/tasks-fs.js';
import { registerGlob } from '../register-file-types.js';

const { TaskFileDelete } = TasksFSApi;

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
