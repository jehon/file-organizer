
const FileGeneric = require('./file-generic.js');

const map = new Map();

class FileUnsupported extends FileGeneric {
	constructor(filePath, parent = null) {
		super(filePath, parent);
		const i = map.has(this.getExtension().toLowerCase()) ? map.get(this.getExtension().toLowerCase()) : 0;
		map.set(this.getExtension().toLowerCase(), i + 1);
	}

	async check() {
		return this.addMessageImpossible('FILE_UNSUPPORTED', 'File unuspported: ' + this.getExtension());
	}
}

FileUnsupported.dumpDiscoveredExtension = function() {
	if (map.size > 0) {
		console.info('Found unsupported file extensions: ');
		for (const [key, value] of map) {
			console.info(key + ': ' + value);
		}
	}
};

module.exports = FileUnsupported;
