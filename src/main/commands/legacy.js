
const options = require('../../../file-organizer/options.js');
const FileUnsupported = require('../../../file-organizer/main/file-unsupported.js');
const FileMovie = require('../../../file-organizer/file-movie.js');

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
