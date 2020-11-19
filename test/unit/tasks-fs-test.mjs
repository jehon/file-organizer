
import { t } from '../test-helper.js';
import {
    TaskFileDelete
} from '../../src/main/tasks-fs.js';

import { createFileFrom, fileExists } from './help-functions.mjs';

describe(t(import.meta), function () {
    it('should delete a file', async function () {
        const f = await createFileFrom('jh-patch-file-patch.txt');

        await (new TaskFileDelete())
            .setParent(f)
            .run();

        expect(await fileExists(f.path)).toBeFalsy();
    });
});
