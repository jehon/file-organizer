
import { t, __filename } from '../test-helper.js';
import File from '../../src/main/file-types/file.js';
import {
    fileDeleteAndRelease,
    folderListing,
    checkAndReserveName,
    fileExistsPhysically
} from '../../src/main/fs-utils.js';

import { createFileFrom, dataPath } from './help-functions.mjs';

describe(t(import.meta), function () {
    it('should delete a file', async function () {
        const fp = await createFileFrom('jh-patch-file-patch.txt');
        const f = new File(fp);

        await fileDeleteAndRelease(f);

        expect(await fileExistsPhysically(fp)).toBeFalsy();

        expect(f.get(File.I_FILENAME).current).toBeFalsy();
        expect(f.get(File.I_FILENAME).isDone()).toBeTrue();
    });

    it('should list a folder', async function () {
        const f = new File(dataPath(''));

        const list = await (folderListing(f));

        for (const fp of list) {
            expect(await fileExistsPhysically(fp.currentFilePath)).toBeFalsy();
            expect(fp.currentFilePath).not.toBe('.');
            expect(fp.currentFilePath).not.toBe('..');
        }
        expect(list.length).toBe(15);
    });

    it('should findIndexedFilename', async function () {
        expect(await fileExistsPhysically(__filename(import.meta))).toBeTruthy();
        expect(await fileExistsPhysically(__filename(import.meta) + '.brol')).toBeFalsy();

        // Ask to move to new file, but without telling him it is itself -> should be incremented
        const fp = await createFileFrom('jh-patch-file-patch.txt');
        expect(await fileExistsPhysically(fp)).toBeTruthy();

        await fileDeleteAndRelease(fp);
        expect(await fileExistsPhysically(fp)).toBeFalsy();
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

        await fileDeleteAndRelease(fp);
    });

});
