
import options from '../../../file-organizer/options.js';
import fileUtils from '../../../file-organizer/file-utils.js';
import FileUnsupported from '../../../file-organizer/main/file-unsupported.js';

export const command = 'unsupported';

export const describe = 'Get some info about the files';

export const handler = function (noptions) {
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
