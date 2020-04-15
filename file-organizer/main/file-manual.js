
const File = require('./file.js');
const {
    STATUS_FAILURE
} = require('../constants.js');


module.exports = class FileManual extends File {
    async analyse() {
        // return this.addMessageImpossible('TS_MANUAL', 'Manual operation needed');
        return super.analyse()
            .then(() => this.notify(STATUS_FAILURE))
    }
};
