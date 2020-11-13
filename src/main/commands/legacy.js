
import options from '../../../file-organizer/options.js';
import FileUnsupported from '../../../file-organizer/main/file-unsupported.js';
import FileMovie from '../../../file-organizer/file-movie.js';

export const command = 'legacy';

export const describe = 'Get some info about the files';

export const handler = function (noptions) {
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
