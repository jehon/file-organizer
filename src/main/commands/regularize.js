
import { dumpDiscoveredExtension } from '../file-types/file-unsupported.js';
import options from '../../../file-organizer/options.js';
import iterate from '../iterate.js';
import File, { FOError } from '../file-types/file.js';
import fileUtils from '../../../file-organizer/file-utils.js';
import messages from '../../../file-organizer/messages.js';
import chalk from 'chalk';

export const command = ['$0 [files..]', 'regularize [files..]'];

export const describe = 'Regularize the files';

/**
 * @param {object} noptions the current options
 * @returns {Promise<void>} when finished
 */
export async function handler(noptions) {
    Object.assign(options, noptions);

    if (!options.headless) {
        await import('../../gui.js');
    }

    await Promise.all(options.files.map(
        f0 => iterate(f0,
            /**
             * @param {File} fi to be dumped
             * @returns {Promise<void>} when done
             */
            async function (fi) {
                await fi.runAnalyse();
                try {
                    fi.runConsistencyCheck();
                    if (!options.dryRun) {
                        await fi.runActing();
                    }
                } catch (e) {
                    if (!(e instanceof FOError)) {
                        throw e;
                    }
                }
                const actionsList = fi.getActionsList();
                const problemsList = fi.getProblemsList();
                if (actionsList.length + problemsList.length > 0) {
                    process.stdout.write(chalk.yellow(`* ${fileUtils.getPathRelativeTo(fi.currentFilePath, f0.parent.currentFilePath)}\n`));
                }
                actionsList.forEach(l => process.stdout.write(`  ${messages.IconSuccess} ${l}\n`));
                problemsList.forEach(l => process.stdout.write(chalk.red(`  ${messages.IconFailure} ${l}\n`)));
            })
    ));

    console.info('\n\nDone');
    dumpDiscoveredExtension();
    // console.info(FileGeneric.pendings);
}
