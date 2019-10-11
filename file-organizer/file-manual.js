
const FileGeneric = require('./file-generic.js');

module.exports = class FileManual extends FileGeneric {
	async check() {
		return this.addMessageImpossible('TS_MANUAL', 'Manual operation needed');
	}
};
