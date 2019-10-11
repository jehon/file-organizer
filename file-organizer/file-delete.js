
const FileGeneric = require('./file-generic.js');

module.exports = class FileDelete extends FileGeneric {
	async check() {
		return await this.addMessageCommit(
			'DEL_DEL',
			'delete unused',
			'-',
			() => this.remove()
		);
	}
};
