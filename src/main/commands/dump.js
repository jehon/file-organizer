
import chalk from 'chalk';
import path from 'path';
import options from '../../common/options.js';
import { IconFailure, IconSuccess } from '../console-utils.js';
import FileTimed from '../file-types/file-timed.js';
import { dumpDiscoveredExtension } from '../file-types/file-unsupported.js';
import File from '../file-types/file.js';
import iterate from '../iterate.js';

export const command = 'dump [files..]';

export const describe = 'Get some info about the files';

export const builder = {
    all: {
        type: 'boolean',
        default: false
    }
};

const padFilename = 60;
const padExtension = 5;
const padTimestamp = 22;
const padTitle = 50;

/**
 * @param {string} str to be formatted
 * @param {number} ll the padding
 * @returns {string} formatted left
 */
function l(str, ll) {
    str = '' + str;
    if (str.length > ll) {
        str = str.slice(0, ll - 1) + '…';
    }
    return str.padEnd(ll);
}

/**
 * @param {string} str to be formatted
 * @param {number} ll the padding
 * @returns {string} formatted right
 */
function r(str, ll) {
    if (str.length > ll) {
        str = '…' + str.slice(-ll + 1) + '';
    }
    return str.padEnd(ll);
}

/**
 * @param {object} noptions the current options
 * @returns {Promise<void>} when finished
 */
export async function handler(noptions) {
    Object.assign(options, noptions, {
        dryRun: true,
        withFileSummary: false
    });

    console.info('  '
        + l('filename', padFilename)
        + '|'
        + l('ext', padExtension)
        + '|'
        + l('timestamp', padTimestamp)
        + '|'
        + l('title', padTitle)
    );
    console.info('-'.repeat(padFilename + padExtension + padTimestamp + padTitle + 4));

    await Promise.all(options.files.map(
        f0 => iterate(f0,
            /**
             * @param {File} fi to be dumped
             * @returns {Promise<void>} when done
             */
            async function (fi) {
                await fi.loadData();
                let ok;
                try {
                    fi.runPrepare();
                    ok = true;
                } catch {
                    ok = false;
                }

                if (!options.all && ok) {
                    // Display only problems
                    return;
                }

                const sep = (ok) ? '|' : '|';
                let msg = ''
                    + r(path.relative(process.cwd(), fi.currentFilePath), padFilename)
                    + sep
                    + l(fi.get(File.I_EXTENSION).initial, padExtension)
                    + sep
                    + (fi.get(FileTimed.I_FT_TIME)
                        ? l(fi.get(FileTimed.I_FT_TIME).initial, padTimestamp)
                        : IconFailure + ' ' + chalk.red(l(fi.get(File.I_F_TIME).initial, padTimestamp - 2))
                    )
                    + sep
                    + (fi.get(FileTimed.I_FT_TITLE)
                        ? l(fi.get(FileTimed.I_FT_TITLE).initial, padTitle)
                        : IconFailure + ' ' + chalk.red(l(fi.get(File.I_F_TITLE).initial, padTitle - 2))
                    )
                    ;

                if (ok) {
                    process.stdout.write(IconSuccess + ' ' + msg + '\n');
                } else {
                    process.stdout.write(IconFailure + ' ' + chalk.red(msg) + '\n');
                }

            })
    ));

    console.info('\n\n');
    dumpDiscoveredExtension();
}
