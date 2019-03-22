
const FileGeneric = require('./file-generic.js');

module.exports = class FileDelete extends FileGeneric {
	async check() {
		{
			await this.checkMsg('ERR', 'delete unused',
				'-',
				() => this.remove()
			);
		}
		return true;
	}
};
