
// const FileGeneric = require('../file-generic.js');
const FileUnsupported = require('../../../file-organizer/main/file-unsupported.js');
const options = require('../../../file-organizer/options.js');

exports.command = ['$0 [files..]', 'regularize [files..]'];

exports.describe = 'Regularize the files';

exports.handler = function (noptions) {
    Object.assign(options, noptions);

    if (!options.headless) {
        import('../../gui.js');
    }

    return Promise.all(options.files.map(
        fi => fi.iterate(
            f => f.loadData()
                .then(f => f.check())
        ))
    )
        .then(() => {
            console.info('\n\nDone');
            FileUnsupported.dumpDiscoveredExtension();
            // console.info(FileGeneric.pendings);
        });
};
