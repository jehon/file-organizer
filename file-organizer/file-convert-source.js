
const FileGeneric = require('./file-generic.js');

module.exports = class ConvertSourceFile extends FileGeneric {
	check() {
		return this.addMessageImpossible('FILE_CONVERT_SOURCE', 'Please remove source file of conversion');
	}
};
