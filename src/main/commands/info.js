
const options = require('../../../file-organizer/options.js');
const fileFactory = require('../file-factory.js');
const { Timestamp } = require('../../../file-organizer/timestamp.js');

exports.command = 'info <file>';

exports.describe = 'Get some info about the file';

exports.builder = {
    key: {
        alias: ['k'],
        default: ''
    },
    file: {
        type: 'string'
    }
};

const presentIt = (k, v) => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    if (v instanceof Timestamp) {
        return v.humanReadable();
    }
    return v;
};

exports.handler = async function (noptions) {
    Object.assign(options, noptions, {
        headless: true,
        dryRun: true,
        withFileSummary: false
    });

    return fileFactory(options.file)
        .then(f => f.loadData())
        .then(f => {
            if (options.key) {
                if (options.key in f) {
                    process.stdout.write(presentIt('', f[options.key]) + '\n');
                } else {
                    process.stdout.write('\n');
                }
            } else {
                process.stdout.write(JSON.stringify(f, presentIt, 2) + '\n');
            }
        });
};
