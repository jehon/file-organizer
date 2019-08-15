
const fs = require('fs');
const path = require('path');

const FileTimestamped = require('./file-timestamped.js');
const FileHidden = require('./file-hidden.js');

class FileFolder extends FileTimestamped {
	isType() {
		return 'folder';
	}

	getList() {
		const FileFactory = require('./file-factory.js');

		const res = [];
		for(const l of fs.readdirSync(this.getRelativePath())) {
			const f = FileFactory(path.join(this.getRelativePath(), l));
			if (f instanceof FileHidden) {
				continue;
			}
			res.push(f);
		}
		return res;
	}

	async iterate(apply) {
		return Promise.all(this.getList().map(f => f.iterate(apply)))
			.then(() => console.info(`\n** folder done: ${this.getRelativePath()}`));
	}
}

module.exports = FileFolder;
