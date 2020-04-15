
const options = require('../options.js');
const fileUtils = require('../file-utils.js');
const FileUnsupported = require('../main/file-unsupported.js');

exports.command = 'unsupported';

exports.describe = 'Get some info about the files';

exports.handler = function (noptions) {
    Object.assign(options, noptions, {
        showHidden: true
    });

    return Promise.all(options.files.map(
        f0 => f0.iterate(
            f => {
                if (f instanceof FileUnsupported) {
                    process.stdout.write('Unsupported: ', fileUtils.getPathRelativeTo(f.getPath()) + '\n');
                }
            })
    ))
        .then(() => {
            console.info('\n\n');
            FileUnsupported.dumpDiscoveredExtension();
        });
};
