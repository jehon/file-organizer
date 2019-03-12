
const { createFileGeneric } = require('./helpers.js');
const { fileExists, fileDelete, findIndexedFilename, fileExec  } = require('../../regularize/file-utils.js');

describe('file-utils-test', function() {
	it('should findIndexedFilename', async function() {
		expect(await fileExists(__filename)).toBeTruthy();
		expect(await fileExists(__filename + '.brol')).toBeFalsy();

		expect(await findIndexedFilename('/', 'anything', 'allthing', '.ext')).toBe('anything');
		expect(await findIndexedFilename('/', 'anything', 'anything~1', '.ext')).toBe('anything');

		// Ask to move to new file, but without telling him it is itself -> should be incremented
		const new1 = createFileGeneric('jh-patch-file-patch.txt');
		expect(await fileExists(new1.getRelativePath())).toBeTruthy();
		expect(await findIndexedFilename(new1.parent.getRelativePath(), new1.getFilename(), 'anything', new1.getExtension())).toBe('jh-patch-file-patch~1');

		await fileDelete(new1.getRelativePath());
		expect(await fileExists(new1.getRelativePath())).toBeFalsy();
	});

	it('should launch subprocesses', function() {
		expect(fileExec('ls', [ '/' ])).toContain('dev');
		expect(() => fileExec('anything')).toThrow();

		expect(() => fileExec('ls', [ '/anything' ])).toThrowError();
		// Erase just written error message
		process.stdout.write('\u001B[1A\r\u001B[K');
	});
});
