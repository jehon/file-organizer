
const fs = require('fs');
const path = require('path');

const messages = require('./messages.js');
const FileTimestamped = require('./file-timestamped.js');
const FileHidden = require('./file-hidden.js');

class FileFolder extends FileTimestamped {
	getType() {
		return 'folder';
	}

	async getList() {
		const fileFactory = require('./file-factory.js');

		return fs.promises.readdir(this.getRelativePath())
			// Remove hidden files
			.then(list => list.filter(f => f[0] != '.'))
			.then(list => Promise.all(
				list.map(async f => await fileFactory(path.join(this.getRelativePath(), f)))
			))
			// Remove "FileHidden" files
			.then(list => list.filter(f => ! (f instanceof FileHidden)));
	}

	async iterate(apply) {
		return Promise.resolve(this)
			.then(() => messages.fileStart(this))
			.then(() => this.getList())
			.then(list => Promise.all(list.map(
				f => {
					if (f instanceof FileFolder) {
						return f.iterate(apply);
					} else {
						return messages.concurrencyLimit(() => f.iterate(apply)).catch();
					}
				})
			))
			.then((res) => { messages.fileEnd(this); return res; });
	}
}

module.exports = FileFolder;
