
const fs = require('fs');
const path = require('path');

const FileTimestamped = require('./file-timestamped.js');
const FileHidden = require('./file-hidden.js');

class FileFolder extends FileTimestamped {
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
		const res = [];
		for(const f of this.getList()) {
			res.push(f.iterate(apply));
		}
		return Promise.all(res);
	}
}

module.exports = FileFolder;
