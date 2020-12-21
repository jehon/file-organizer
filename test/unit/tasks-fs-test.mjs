
import { t } from '../test-helper.js';
import File from '../../src/main/file-types/file.js';
import {
    fileDelete,
    folderListing
} from '../../src/main/tasks-fs.js';

import { createFileFrom, fileExists, dataPath } from './help-functions.mjs';

describe(t(import.meta), function () {
    it('should delete a file', async function () {
        const fp = await createFileFrom('jh-patch-file-patch.txt');
        const f = new File(fp);

        await fileDelete(f);

        expect(await fileExists(fp)).toBeFalsy();

        expect(f.get(File.I_FILENAME).current).toBeFalsy();
        expect(f.get(File.I_FILENAME).isDone()).toBeTrue();
    });

    it('should list a folder', async function () {
        const f = new File(dataPath(''));

        const list = await (folderListing(f));

        for (const fp of list) {
            expect(await fileExists(fp.currentFilePath)).toBeFalsy();
            expect(fp.currentFilePath).not.toBe('.');
            expect(fp.currentFilePath).not.toBe('..');
        }
        expect(list.length).toBe(15);
    });
});
