
const FileHidden = require('./file-hidden.js');

const map = new Map();

class FileUnsupported extends FileHidden {
	constructor(filePath, parent = null) {
		super(filePath, parent);
		const i = map.has(this.getExtension().toLowerCase()) ? map.get(this.getExtension().toLowerCase()) : 0;
		map.set(this.getExtension().toLowerCase(), i + 1);
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
