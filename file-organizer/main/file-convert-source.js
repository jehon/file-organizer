
const File = require('./file.js');
const {
    STATUS_FAILURE
} = require('../constants.js');
const InfoProblem = require('./info-problem.js');
const FileGeneric = require('../file-generic.js');

class FileConvertSource extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.createInfo(InfoProblem, 'Please remove the source file after verifying the conversion'))
            .then(() => this.notify(STATUS_FAILURE));
    }
}

module.exports = FileConvertSource;

FileConvertSource.init = async function () {
    await import('../../src/main/register-file-types.js').then(({ registerGlob }) => {
        registerGlob([
            '#recycle',
            '@eaDir',
            // TODO ??? '.*',
            '*' + FileGeneric.convertedSuffix + '.*'
        ], FileConvertSource);
    });
};