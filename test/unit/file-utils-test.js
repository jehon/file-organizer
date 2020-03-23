
const { createFileGeneric } = require('./helpers.js');
const fileUtils = require('../../file-organizer/file-utils.js');
const helpers = require('./helpers.js');

describe('file-utils-test', function() {
    it('should findIndexedFilename', async function() {
        expect(await helpers.fileExists(__filename)).toBeTruthy();
        expect(await helpers.fileExists(__filename + '.brol')).toBeFalsy();

        // Ask to move to new file, but without telling him it is itself -> should be incremented
        const new1 = await createFileGeneric('jh-patch-file-patch.txt');
        expect(await helpers.fileExists(new1.getPath())).toBeTruthy();

        await fileUtils.fileDelete(new1.getPath());
        expect(await helpers.fileExists(new1.getPath())).toBeFalsy();
    });

    it('should launch subprocesses', async function() {
        expect(await fileUtils.fileExec('ls', [ '/' ])).toContain('dev');
        await expectAsync(fileUtils.fileExec('anything')).toBeRejected();
        await expectAsync(fileUtils.fileExec('ls', [ '/anything' ])).toBeRejectedWithError();

        // Erase just written error message
        process.stdout.write('\u001B[1A\r\u001B[K');
    });

    it('should work with reservations', async function() {
        const new1 = await createFileGeneric('jh-patch-file-patch.txt');
        const new2Name = new1.getPath() + '.ok';

        // The file exists
        await expectAsync(fileUtils.checkAndReserveName(new1.getPath(), 'someone-else')).toBeRejected();

        // It is available
        await expectAsync(fileUtils.checkAndReserveName(new2Name, 'for-me')).toBeResolvedTo(true);

        // It is for me
        await expectAsync(fileUtils.checkAndReserveName(new2Name, 'for-me')).toBeResolvedTo(true);

        // Now it is reserved
        await expectAsync(fileUtils.checkAndReserveName(new2Name, 'someone-else')).toBeRejected();

        await fileUtils.fileDelete(new1.getPath());
    });
});
