
const { createFileGeneric } = require('./helpers.js');
const fileUtils = require('../../file-organizer/file-utils.js');

describe('file-utils-test', function() {
	it('should findIndexedFilename', async function() {
		expect(await fileUtils.fileExists(__filename)).toBeTruthy();
		expect(await fileUtils.fileExists(__filename + '.brol')).toBeFalsy();

		// Ask to move to new file, but without telling him it is itself -> should be incremented
		const new1 = await createFileGeneric('jh-patch-file-patch.txt');
		expect(await fileUtils.fileExists(new1.getRelativePath())).toBeTruthy();

		await fileUtils.fileDelete(new1.getRelativePath());
		expect(await fileUtils.fileExists(new1.getRelativePath())).toBeFalsy();
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
		const new2Name = new1.getRelativePath() + '.ok';

		// The file exists
		await expectAsync(fileUtils.checkAndReserveName(new1.getRelativePath())).toBeRejected();

		// It is available
		await expectAsync(fileUtils.checkAndReserveName(new2Name)).toBeResolvedTo(true);

		// Now it is reserved
		await expectAsync(fileUtils.checkAndReserveName(new2Name)).toBeRejected();

		fileUtils.freeReservedName(new2Name);

		// It is again available
		await expectAsync(fileUtils.checkAndReserveName(new2Name)).toBeResolvedTo(true);

		await fileUtils.fileDelete(new1.getRelativePath());
	});
});
