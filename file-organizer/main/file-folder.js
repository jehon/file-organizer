
const fs = require('fs');
const path = require('path');

const File = require('./file.js');
const FileHidden = require('./file-hidden.js');
const Task = require('./task.js');
const options = require('../options.js');

class TaskFolderListing extends Task {
    constructor() {
        const fileFactory = require('../file-factory.js');
        super('Get the folder list', () =>
            fs.promises.readdir(this.parent.path)
                .then(list => list.filter(f => f != '.' && f != '..'))
                .then(list => Promise.all(
                    list.map(async f => await fileFactory(path.join(this.getPath(), f), this))
                ))
                // Remove "FileHidden" files if required
                .then(list => list.filter(f => options.showHidden || (!(f instanceof FileHidden))))
                .then(list => { list.sort(); return list; })
        );
    }
}

class FileFolder extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.createAndRun(TaskFolderListing))
            .then(list =>
                Promise.all(list.map(
                    // Iterate on each child
                    f => f.analyse()
                ))
            );
    }

    // async check() {
    //     /**
    //      * We inherit from FileTimestamped, to have the timestamp
    //      * but we don't want to have their check, neither the check
    //      * of file-generic...
    //      */
    //     return true;
    // }
}

module.exports = FileFolder;
