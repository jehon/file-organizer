
import File from '../../../file-organizer/main/file.js';
// import {
//     TaskFileDelete
// } from '../../../file-organizer/main/tasks-fs.js';
import TasksFSApi from '../../../file-organizer/main/tasks-fs.js';
import { registerGlob } from '../register-file-types.js';

const { TaskFileDelete } = TasksFSApi;

export default class FileDelete extends File {
    async analyse() {
        this.enqueueAct(new TaskFileDelete());
        await super.analyse();
    }
}

registerGlob([
    'Thumbs.db',
    '.picasa.ini'
], FileDelete);
