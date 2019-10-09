
const messages = require('./messages.js');
const FileGeneric = require('./file-generic.js');

module.exports = class FileManual extends FileGeneric {
	async check() {
		return messages.fileImpossible(this, 'TS_MANUAL', 'Manual operation needed');
	}
};
