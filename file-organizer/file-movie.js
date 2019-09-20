
const FileExiv = require('./file-exiv.js');

module.exports = class FileMovie extends FileExiv {
	getType() {
		return 'movie';
	}
};
