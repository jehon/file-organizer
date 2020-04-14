
const File = require('./file.js');

module.exports = class FileHidden extends File {
    async analyse() {
        return super.analyse();
    }
};
