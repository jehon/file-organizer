
// TODO(migration): use the file-folder !!!

import fs from 'fs';
import path from 'path';

import File from './file.js';
import Task from '../task.js';
// import FileHidden from './file-hidden.js';
// import options from '../options.js';

// TODO: MERGE DOWN TO THE FILE.js !!!

import {
    buildFile,
    _regExpMapForFolders,
    // FallbackRegExp
} from '../register-file-types.js';

const folderListing = (file) =>
    fs.promises.readdir(file.path)
        .then(list => list.filter(f => f != '.' && f != '..'))
        .then(list => Promise.all(
            list.map(async f => await buildFile(path.join(file.path, f), this))
        ))
        // // Remove "FileHidden" files if required
        // .then(list => list.filter(f => options.showHidden || (!(f instanceof FileHidden))))
        .then(list => { list.sort(); return list; });


export default class FileFolder extends File {
    /** @type {Array<string>} of filepath in the current folder */
    _list

    async analyse() {
        /**
         * TODO: folder inherit from FileTimestamped
         * We inherit from FileTimestamped, to have the timestamp
         * but we don't want to have their check, neither the check
         * of file-generic...
         */

        return super.analyse()
            .then(() => folderListing(this))
            .then(list => {
                this._list = list;
                Promise.all(
                    list.map(
                        // Iterate on each child
                        f => f.analyse()
                    )
                );
            });
    }

}

// TODO(file-folder): remove this horrible hack
_regExpMapForFolders.set('//', FileFolder);
// registerFallback(FallbackRegExp, FileFolder, {forFiles: false, forFolders: true});
