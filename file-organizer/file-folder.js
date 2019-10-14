
const fs = require('fs');
const path = require('path');

const options = require('./options.js');
const FileTimestamped = require('./file-timestamped.js');
const FileHidden = require('./file-hidden.js');

class FileFolder extends FileTimestamped {
	getType() {
		return 'folder';
	}

	async getList() {
		const fileFactory = require('./file-factory.js');

		return fs.promises.readdir(this.getRelativePath())
			.then(list => list.filter(f => f != '.' && f != '..'))
			.then(list => Promise.all(
				list.map(async f => await fileFactory(path.join(this.getRelativePath(), f), this))
			))
			// Remove "FileHidden" files if required
			.then(list => { list.sort(); return list; })
			.then(list => list.filter(f => options.showHidden || (! (f instanceof FileHidden))));
	}

	async iterate(apply) {
		return Promise.resolve(this)
			.then(() => this.getList())
			.then(list => Promise.all(list.map(
				f => f.iterate(apply)
			)));
	}
}

module.exports = FileFolder;
