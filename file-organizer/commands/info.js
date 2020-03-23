
const messages = require('../messages.js');
const options = require('../options.js');
const fileFactory = require('../file-factory.js');
const { Timestamp } = require('../timestamp.js');

exports.command = 'info <file>';

exports.describe = 'Get some info about the file';

exports.builder = {
    key: {
        alias: [ 'k' ],
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
        dryRun: true,
        withStats: false,
        withFileSummary: false
    });

    fileFactory(options.file)
        .then(f => f.loadData())
        .then(f => {
            if (options.key) {
                if (options.key in f) {
                    messages.writeLine(presentIt('', f[options.key]));
                } else {
                    messages.writeLine('');
                }
            } else {
                messages.writeLine(JSON.stringify(f, presentIt, 2));
            }
        });
};
