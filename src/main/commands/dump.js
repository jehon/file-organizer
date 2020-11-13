
import options from '../../../file-organizer/options.js';
import fileUtils from '../../../file-organizer/file-utils.js';
import FileUnsupported from '../../../file-organizer/main/file-unsupported.js';
import messages from '../../../file-organizer/messages.js';

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
 * @param str
 * @param ll
 */
function l(str, ll) {
    str = '' + str;
    if (str.length > ll) {
        str = str.slice(0, ll - 1) + '…';
    }
    return str.padEnd(ll);
}

/**
 * @param str
 * @param ll
 */
function r(str, ll) {
    if (str.length > ll) {
        str = '…' + str.slice(-ll + 1) + '';
    }
    return str.padEnd(ll);
}

/**
 * @param noptions
 */
export async function handler(noptions) {
    Object.assign(options, noptions, {
        headless: true,
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

    return Promise.all(options.files.map(
        f0 => f0.iterate(
            fi => fi.loadData()
                .then(fi => fi.check().then(() => fi))
                .then(fi => {
                    const ok = fi.stats.fixSkipped == 0;
                    if (!options.all && ok) {
                        // Display only problems
                        return;
                    }
                    const sep = (ok) ? '|' : '|';
                    let msg = ''
                        + r(fileUtils.getPathRelativeTo(fi.parent.getPath()) + '/' + fi.getFilename(), padFilename)
                        + sep
                        + l(fi.generic_original_extension, padExtension)
                        + sep
                        + (fi.exif_timestamp
                            ? l(fi.exif_timestamp.humanReadable(), padTimestamp)
                            : messages.IconFailure + ' ' + l(fi.filenameTS.original, padTimestamp - 2).red
                        )
                        + sep
                        + (fi.exif_title
                            ? l(fi.exif_title, padTitle)
                            : messages.IconFailure + ' ' + l(fi.filenameTS.title, padTitle - 2).red
                        )
                        ;

                    if (ok) {
                        process.stdout.write(messages.IconSuccess + ' ' + msg + '\n');
                    } else {
                        process.stdout.write(messages.IconFailure + ' ' + msg.red + '\n');
                    }

                })
        )
    ))
        .then(() => {
            console.info('\n\n');
            FileUnsupported.dumpDiscoveredExtension();
        });
}
