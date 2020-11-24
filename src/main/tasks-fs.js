
import fs from 'fs';
// const path = require('path');

import Task from './task.js';

export class TaskFileDelete extends Task {
    constructor() {
        super('Delete file', () =>
            fs.promises.unlink(this.parent.currentFilePath)
        );
    }
}
