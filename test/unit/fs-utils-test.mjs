
import { t, __filename } from '../test-helper.js';
import File from '../../src/main/file-types/file.js';
import {
    fileDelete,
    folderListing
} from '../../src/main/fs-utils.js';

import { createFileFrom, dataPath } from './help-functions.mjs';
import { checkAndReserveName, fileExists } from '../../src/main/fs-utils.js';

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

    it('should findIndexedFilename', async function () {
        expect(await fileExists(__filename(import.meta))).toBeTruthy();
        expect(await fileExists(__filename(import.meta) + '.brol')).toBeFalsy();

        // Ask to move to new file, but without telling him it is itself -> should be incremented
        const fp = await createFileFrom('jh-patch-file-patch.txt');
        expect(await fileExists(fp)).toBeTruthy();

        await fileDelete(fp);
        expect(await fileExists(fp)).toBeFalsy();
    });

    it('should work with reservations', async function () {
        const fp = await createFileFrom('jh-patch-file-patch.txt');
        const new2Name = fp + '.ok';

        // The file exists
        await expectAsync(checkAndReserveName(fp, 'someone-else')).toBeRejected();

        // It is available
        await expectAsync(checkAndReserveName(new2Name, 'for-me')).toBeResolvedTo(true);

        // It is for me
        await expectAsync(checkAndReserveName(new2Name, 'for-me')).toBeResolvedTo(true);

        // Now it is reserved
        await expectAsync(checkAndReserveName(new2Name, 'someone-else')).toBeRejected();

        await fileDelete(fp);
    });

});
