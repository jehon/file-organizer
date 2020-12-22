
import options from '../../common/options.js';
import { buildFile } from '../../../src/main/register-file-types.js';
import Timestamp from '../timestamp.js';

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

    const f = buildFile(options.file);
    await f.runAnalyse();
    if (options.key) {
        const opt = f.get(options.key);
        if (opt) {
            process.stdout.write(presentIt('', opt.initial) + '\n');
        } else {
            process.stdout.write('\n');
        }
    } else {
        const res = {};
        for (const k of Object.keys(f.values)) {
            res[k] = f.get(k).initial;
        }

        process.stdout.write(JSON.stringify(res, presentIt, 2) + '\n');
    }
};
