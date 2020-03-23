
const options = require('../options.js');
const fileUtils = require('../file-utils.js');
const FileUnsupported = require('../file-unsupported.js');
const messages = require('../messages.js');

exports.command = 'dump [files..]';

exports.describe = 'Get some info about the files';

exports.builder = {
    all: {
        type: 'boolean',
        default: false
    }
};

const padFilename = 60;
const padExtension = 5;
const padTimestamp = 22;
const padTitle = 50;

function l(str, ll) {
    str = '' + str;
    if (str.length > ll) {
        str = str.slice(0, ll - 1) + '…';
    }
    return str.padEnd(ll);
}

function r(str, ll) {
    if (str.length > ll) {
        str = '…' + str.slice(-ll + 1) + '';
    }
    return str.padEnd(ll);
}

exports.handler = function (noptions) {
    Object.assign(options, noptions, {
        dryRun: true
    });
    options.dryRun = true;
    options.withFileSummary = false;
    options.withStats = false;

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
                .then(async fi => { await fi.check(); return fi; })
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
                        messages.writeLine(messages.IconSuccess + ' ' + msg);
                    } else {
                        messages.writeLine(messages.IconFailure + ' ' + msg.red);
                    }

                })
        ))
    )
        .then(() => {
            console.info('\n\n');
            FileUnsupported.dumpDiscoveredExtension();
        });
};
