
import options from '../../common/options.js';
import { buildFile } from '../../../src/main/register-file-types.js';

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

export const handler = async function (noptions) {
    Object.assign(options, noptions, {
        dryRun: true,
        withFileSummary: false
    });

    const f = buildFile(options.file);
    await f.loadData();
    if (options.key) {
        const opt = f.get(options.key);
        if (opt) {
            process.stdout.write(opt.initial + '\n');
        } else {
            process.stdout.write('\n');
        }
    } else {
        const res = {};
        for (const k of Object.keys(f.values)) {
            res[k] = f.get(k).initial;
        }

        process.stdout.write(JSON.stringify(res, null, 2) + '\n');
    }
};
