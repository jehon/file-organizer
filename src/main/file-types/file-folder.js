
// TODO: use this !!!

import fs from 'fs';
import path from 'path';

import File from './file.js';
import Task from '../task.js';
// import FileHidden from './file-hidden.js';
// import options from '../options.js';

import { regExpMap, buildFile /*, registerFolder*/ } from '../register-file-types.js';

class TaskFolderListing extends Task {
    constructor() {
        super('Get the folder list', () =>
            fs.promises.readdir(this.parent.path)
                .then(list => list.filter(f => f != '.' && f != '..'))
                .then(list => Promise.all(
                    list.map(async f => await buildFile(path.join(this.parent.path, f), this))
                ))
                // // Remove "FileHidden" files if required
                // .then(list => list.filter(f => options.showHidden || (!(f instanceof FileHidden))))
                .then(list => { list.sort(); return list; })
        );
    }
}

export default class FileFolder extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.addAnalysisTask(TaskFolderListing, this))
            .then(list => {
                this._list = list;
                Promise.all(list.map(
                    // Iterate on each child
                    f => f.analyse()
                ));
            });
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

// TODO: remove this horrible hack  (file-folder)
regExpMap.set('//', FileFolder);
// registerFolder(FileFolder);
