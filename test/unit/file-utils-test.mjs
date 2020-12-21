
import { t, __filename } from '../test-helper.js';

import { createFileFrom, fileExists } from './help-functions.mjs';
import fileUtils from '../../file-organizer/file-utils.js';

describe(t(import.meta), function () {
    it('should findIndexedFilename', async function () {
        expect(await fileExists(__filename(import.meta))).toBeTruthy();
        expect(await fileExists(__filename(import.meta) + '.brol')).toBeFalsy();

        // Ask to move to new file, but without telling him it is itself -> should be incremented
        const fp = await createFileFrom('jh-patch-file-patch.txt');
        expect(await fileExists(fp)).toBeTruthy();

        await fileUtils.fileDelete(fp);
        expect(await fileExists(fp)).toBeFalsy();
    });

    it('should launch subprocesses', async function () {
        expect(await fileUtils.fileExec('ls', ['/'])).toContain('dev');
        await expectAsync(fileUtils.fileExec('anything')).toBeRejected();
        await expectAsync(fileUtils.fileExec('ls', ['/anything'])).toBeRejectedWithError();

        // Erase just written error message
        process.stdout.write('\u001B[1A\r\u001B[K');
    });

    it('should work with reservations', async function () {
        const fp = await createFileFrom('jh-patch-file-patch.txt');
        const new2Name = fp + '.ok';

        // The file exists
        await expectAsync(fileUtils.checkAndReserveName(fp, 'someone-else')).toBeRejected();

        // It is available
        await expectAsync(fileUtils.checkAndReserveName(new2Name, 'for-me')).toBeResolvedTo(true);

        // It is for me
        await expectAsync(fileUtils.checkAndReserveName(new2Name, 'for-me')).toBeResolvedTo(true);

        // Now it is reserved
        await expectAsync(fileUtils.checkAndReserveName(new2Name, 'someone-else')).toBeRejected();

        await fileUtils.fileDelete(fp);
    });
});
