
const File = require('./file.js');
const {
    STATUS_FAILURE
} = require('../constants.js');
const InfoProblem = require('./info-problem.js');

module.exports = class FileManual extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.createInfo(InfoProblem, 'Manual operation needed'))
            .then(() => this.notify(STATUS_FAILURE));
    }
};
