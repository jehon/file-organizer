
const options = require('../options.js');
const FileUnsupported = require('../file-unsupported.js');
const FileMovie = require('../file-movie.js');

exports.command = 'legacy';

exports.describe = 'Get some info about the files';

exports.handler = function (noptions) {
    Object.assign(options, noptions, {
    });

    return Promise.all(options.files.map(
        fi => fi.iterate(
            f => {
                if (f instanceof FileMovie) {
                    return f.loadData()
                        .then(f => f.check());
                }
                return Promise.resolve(true);
            })
    ))
        .then(() => {
            console.info('\n\nDone');
            FileUnsupported.dumpDiscoveredExtension();
        });
};
