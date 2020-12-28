
import chalk from 'chalk';
import path from 'path';
import options from '../../common/options.js';
import { IconFailure, IconSuccess } from '../console-utils.js';
import { dumpDiscoveredExtension } from '../file-types/file-unsupported.js';
import File, { FOError } from '../file-types/file.js';
import iterate from '../iterate.js';


export const command = ['$0 [files..]', 'regularize [files..]'];

export const describe = 'Regularize the files';

/**
 * @param {object} noptions the current options
 * @returns {Promise<void>} when finished
 */
export async function handler(noptions) {
    Object.assign(options, noptions);

    await Promise.all(options.files.map(
        f0 => iterate(f0,
            /**
             * @param {File} fi to be dumped
             * @returns {Promise<void>} when done
             */
            async function (fi) {
                await fi.loadData();
                try {
                    fi.runPrepare();
                    if (!options.dryRun) {
                        await fi.runFix();
                    }
                } catch (e) {
                    if (!(e instanceof FOError)) {
                        throw e;
                    }
                }
                const actionsList = fi.getActionsList();
                const problemsList = fi.getProblemsList();
                if (actionsList.length + problemsList.length > 0) {
                    process.stdout.write(chalk.yellow(`* ${path.relative(f0.parent.currentFilePath, fi.currentFilePath)}\n`));
                }
                actionsList.forEach(l => process.stdout.write(`  ${IconSuccess} ${l}\n`));
                problemsList.forEach(l => process.stdout.write(chalk.red(`  ${IconFailure} ${l}\n`)));
            })
    ));

    console.info('\n\nDone');
    dumpDiscoveredExtension();
    // console.info(FileGeneric.pendings);
}
