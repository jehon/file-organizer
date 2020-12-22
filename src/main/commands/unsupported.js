
import path from 'path';
import options from '../../common/options.js';
import FileUnsupported, { dumpDiscoveredExtension } from '../file-types/file-unsupported.js';

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
                    process.stdout.write('Unsupported: ', path.relative(f0.parent.currentFilePath, f.currentFilePath) + '\n');
                }
            })
    ))
        .then(() => {
            console.info('\n\n');
            dumpDiscoveredExtension();
        });
};
