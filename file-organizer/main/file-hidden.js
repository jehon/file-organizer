
const File = require('./file.js');

class FileHidden extends File {
    async analyse() {
        return super.analyse();
    }
}

module.exports = FileHidden;

FileHidden.init = async function () {
    await import('../../src/main/register-file-types.js').then(({ registerGlob, registerRegex }) => {
        registerGlob([
            '#recycle',
            '@eaDir',
            '.*',
        ], FileHidden);

        registerRegex(/^[^.]+$/i, FileHidden);
    });
};