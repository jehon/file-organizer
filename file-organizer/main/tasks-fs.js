
const fs = require('fs');
// const path = require('path');

const Task = require('./task.js');

class TaskFileDelete extends Task {
    constructor() {
        super('Delete file', () =>
            fs.promises.unlink(this.parent.path)
        );
    }
}

module.exports = {
    TaskFileDelete
};
