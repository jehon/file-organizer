import { t } from '../test-helper.js';

import iterate from '../../src/main/iterate.js';

import {
    dataPath
} from './help-functions.mjs';
// TODO: use buildFile
// import { buildFile } from '../../src/main/register-file-types.js';
import File from '../../src/main/file-types/file.js';

describe(t(import.meta), function () {
    it('should iterate', async () => {
        const root = new File(dataPath('system_test'));
        const res = await iterate(root, _f => '123');

        expect(Object.keys(res).length).toBe(9);
        expect(res[dataPath('system_test')]).toBe('123');
    });
});
