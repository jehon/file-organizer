
const FileHidden = require('./file-hidden.js');

const map = new Map();

class FileUnsupported extends FileHidden {
	constructor(filePath) {
		super(filePath);
		const i = map.has(this.getExtension()) ? map.get(this.getExtension()) : 0;
		map.set(this.getExtension(), i + 1);
	}

	getType() {
		return 'unsupported';
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
