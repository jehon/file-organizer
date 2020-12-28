import { t } from './help-functions.mjs';

import iterate from '../../src/main/iterate.js';

import {
    dataPath
} from './help-functions.mjs';
import { buildFile } from '../../src/main/register-file-types.js';

describe(t(import.meta), function () {
    it('should iterate', async () => {
        const root = buildFile(dataPath('system_test'));
        const res = await iterate(root, _f => '123');

        // console.log(res);

        expect(Object.keys(res).length).toBe(9);
        expect(res[dataPath('system_test')]).toBe('123');
    });
});
