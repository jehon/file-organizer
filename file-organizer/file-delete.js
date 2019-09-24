
const FileGeneric = require('./file-generic.js');
const messages = require('./messages.js');

module.exports = class FileDelete extends FileGeneric {
	async check() {
		return await messages.fileCommit(this, 'DEL_DEL', 'delete unused',
			'-',
			() => this.remove()
		);
	}
};
