
import { t } from '../test-helper.js';
import File from '../../src/main/file-types/file.js';
import {
    fileDelete
} from '../../src/main/tasks-fs.js';

import { createFileFrom, fileExists } from './help-functions.mjs';

describe(t(import.meta), function () {
    // it('should delete a file', async function () {
    //     const f = await createFileFrom('jh-patch-file-patch.txt');

    //     await (new TaskFileDelete())
    //         .setParent(f)
    //         .run();

    //     expect(await fileExists(f.currentFilePath)).toBeFalsy();
    // });

    it('should delete a file', async function () {
        const f = await createFileFrom('jh-patch-file-patch.txt');
        const fp = f.currentFilePath;

        await fileDelete(f);

        expect(await fileExists(fp)).toBeFalsy();

        expect(f.get(File.I_FILENAME).current).toBeFalsy();
        expect(f.get(File.I_FILENAME).isDone()).toBeTrue();
    });
});
