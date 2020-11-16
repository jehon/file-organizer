
import options from '../../../file-organizer/options.js';
import { buildFile } from '../../../src/main/register-file-types.js';
import timestampAPI from '../../../file-organizer/timestamp.js';
const { Timestamp } = timestampAPI;

export const command = 'info <file>';

export const describe = 'Get some info about the file';

export const builder = {
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

export const handler = async function (noptions) {
    Object.assign(options, noptions, {
        headless: true,
        dryRun: true,
        withFileSummary: false
    });

    return buildFile(options.file)
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
