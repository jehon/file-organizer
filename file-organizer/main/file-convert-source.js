
const File = require('./file.js');
const {
    STATUS_FAILURE
} = require('../constants.js');


module.exports = class FileConvertSource extends File {
    async analyse() {
        // return this.addMessageImpossible('FILE_CONVERT_SOURCE', 'Please remove source file of conversion');
        return super.analyse()
            .then(() => this.notify(STATUS_FAILURE));
    }
};
