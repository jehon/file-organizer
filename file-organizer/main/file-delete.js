
const File = require('./file.js');
const {
    TaskFileDelete
} = require('./tasks-fs.js');

module.exports = class FileDelete extends File {
    async analyse() {
        this.enqueueAct(new TaskFileDelete());
        await super.analyse();
    }
};
