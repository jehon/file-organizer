
const File = require('./file.js');
const {
    STATUS_FAILURE
} = require('../constants.js');
const InfoProblem = require('./info-problem.js');

class FileManual extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.createInfo(InfoProblem, 'Manual operation needed'))
            .then(() => this.notify(STATUS_FAILURE));
    }
}

module.exports = FileManual;

FileManual.init = async function () {
    await import('../../src/main/register-file-types.js').then(({ registerGlob }) => {
        registerGlob([
            '*.doc*'
        ], FileManual);
    });
};