
const File = require('./file.js');
const {
    STATUS_FAILURE
} = require('../constants.js');
const InfoProblem = require('./info-problem.js');

module.exports = class FileConvertSource extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.createInfo(InfoProblem, 'Please remove the source file after verifying the conversion'))
            .then(() => this.notify(STATUS_FAILURE));
    }
};
