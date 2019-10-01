
const { createFileGeneric } = require('./helpers.js');
const { fileExists, fileDelete, fileExec, checkAndReserveName, freeReservedName  } = require('../../file-organizer/file-utils.js');

describe('file-utils-test', function() {
	it('should findIndexedFilename', async function() {
		expect(await fileExists(__filename)).toBeTruthy();
		expect(await fileExists(__filename + '.brol')).toBeFalsy();

		// Ask to move to new file, but without telling him it is itself -> should be incremented
		const new1 = await createFileGeneric('jh-patch-file-patch.txt');
		expect(await fileExists(new1.getRelativePath())).toBeTruthy();

		await fileDelete(new1.getRelativePath());
		expect(await fileExists(new1.getRelativePath())).toBeFalsy();
	});

	it('should launch subprocesses', async function() {
		expect(await fileExec('ls', [ '/' ])).toContain('dev');
		await expectAsync(fileExec('anything')).toBeRejected();
		await expectAsync(fileExec('ls', [ '/anything' ])).toBeRejectedWithError();

		// Erase just written error message
		process.stdout.write('\u001B[1A\r\u001B[K');
	});

	it('should work with reservations', async function() {
		const new1 = await createFileGeneric('jh-patch-file-patch.txt');
		const new2Name = new1.getRelativePath() + '.ok';

		// The file exists
		await expectAsync(checkAndReserveName(new1.getRelativePath())).toBeRejected();

		// It is available
		await expectAsync(checkAndReserveName(new2Name)).toBeResolvedTo(true);

		// Now it is reserved
		await expectAsync(checkAndReserveName(new2Name)).toBeRejected();

		freeReservedName(new2Name);

		// It is again available
		await expectAsync(checkAndReserveName(new2Name)).toBeResolvedTo(true);

		await fileDelete(new1.getRelativePath());
	});
});
