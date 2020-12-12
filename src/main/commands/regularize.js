
// import FileGeneric from '../file-generic.js';
import { dumpDiscoveredExtension } from '../file-types/file-unsupported.js';
import options from '../../../file-organizer/options.js';

export const command = ['$0 [files..]', 'regularize [files..]'];

export const describe = 'Regularize the files';

export const handler = function (noptions) {
    Object.assign(options, noptions);

    let p = Promise.resolve();

    if (!options.headless) {
        p = p
            .then(() => import('../../gui.js'))
            .then(() => { });
    }

    return p.then(() =>
        Promise.all(
            options.files.map(
                fi => fi.iterate(
                    f => f.loadData()
                        .then(f => f.check())
                        .catch(e => {
                            console.error(e);
                            throw e;
                        })
                )
            ))
            .then(() => {
                console.info('\n\nDone');
                dumpDiscoveredExtension();
                // console.info(FileGeneric.pendings);
            })
    );
};
