
const fs = require('fs');
const path = require('path');

const FileTimestamped = require('./file-timestamped.js');

class FileFolder extends FileTimestamped {
    async check() {
        /**
		 * We inherit from FileTimestamped, to have the timestamp
		 * but we don't want to have their check, neither the check
		 * of file-generic...
		 */
        return true;
    }

    async getList() {
        const fileFactory = require('./file-factory.js');

        return fs.promises.readdir(this.getPath())
            .then(list => list.filter(f => f != '.' && f != '..'))
            .then(list => Promise.all(
                list.map(async f => await fileFactory(path.join(this.getPath(), f), this))
            ))
        // Remove "FileHidden" files if required
            .then(list => { list.sort(); return list; });
        // .then(list => list.filter(f => options.showHidden || (! (f instanceof FileHidden))));
    }

    async iterate(apply) {
        return Promise.resolve(this)
            .then(() => this.getList())
            .then(list => Promise.all(list.map(
                // Iterate on each child
                f => f.iterate(apply)
            )))
        // Iterate on us-self
            .then(() => super.iterate(apply));
    }
}

module.exports = FileFolder;
