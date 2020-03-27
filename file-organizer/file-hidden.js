
const FileGeneric = require('./file-generic.js');

module.exports = class FileHidden extends FileGeneric {
    async check() {
        return true;
    }
};
