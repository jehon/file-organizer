
const File = require('./file.js');
const {
    TaskFileDelete
} = require('./tasks-fs.js');

class FileDelete extends File {
    async analyse() {
        this.enqueueAct(new TaskFileDelete());
        await super.analyse();
    }
}

module.exports = FileDelete;

FileDelete.init = async function () {
    await import('../../src/main/register-file-types.js').then(({ registerGlob }) => {
        registerGlob([
            'Thumbs.db',
            '.picasa.ini'
        ], FileDelete);
    });
};