
const FileGeneric = require('./file-generic.js');

module.exports = class FileDelete extends FileGeneric {
	async check() {
		{
			await this.checkMsg('delete unused',
				'-',
				() => this.remove()
			);
		}
		return true;
	}
};
