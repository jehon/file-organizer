
const path = require('path');

const { tempPath, createFileGeneric, dataPath } = require('./helpers.js');
const { fileDelete, fileExists } = require('../../file-organizer/file-utils.js');
const FileGeneric = require('../../file-organizer/file-generic.js');

// For mock
const fileUtils = require('../../file-organizer/file-utils.js');

describe('file-generic-test', () => {
	describe('attributes', () => {
		it('should get attributes', async () => {
			const fpath = path.join(dataPath(), 'test.txt');
			let new1 = new FileGeneric(fpath);

			expect(new1.getFilename()).toBe('test');
			expect(new1.getExtension()).toBe('.txt');
			expect(new1.getRelativePath()).toBe(fpath);
		});

		it('should get the parent', function() {
			expect((new FileGeneric(path.join(dataPath(), 'test.txt')))
				.parent.getRelativePath())
				.toBe(dataPath());
			expect((new FileGeneric('.'))
				.parent.getRelativePath())
				.toBe(path.dirname(process.cwd()));
			expect((new FileGeneric('/')).parent).toBeNull();
		});

	});

	describe('infos', () => {
		it('should get infos', () => {
			let new1 = new FileGeneric('test');
			expect(new1.getInfo('file.name')).toBe('test');
			expect(new1.getInfo('does.not.exists')).toBeFalsy();
		});
	});

	// it('should give an indexedFilename', async () => {
	// 	const new1 = createFileGeneric('jh-patch-file-patch.txt');

	// 	expect(await new1.getIndexedFilenameFor('jh-patch-file-patch')).toBe('jh-patch-file-patch');

	// 	// new2 does not really exists
	// 	const new2 = new FileGeneric(path.join(new1.parent.getRelativePath(), 'jh-patch-file-patch~1.txt'));
	// 	expect(await new2.getIndexedFilenameFor('jh-patch-file-patch')).toBe('jh-patch-file-patch~1');

	// 	await fileDelete(new1.getRelativePath());
	// });

	describe('crud', () => {
		it('should changeFilename', async () => {
			const new1 = createFileGeneric('jh-patch-file-patch.txt');

			await new1.changeFilename('file-generic-test-1');
			expect(new1.getFilename()).toBe('file-generic-test-1');
			expect(new1.getExtension()).toBe('.txt');
			expect(new1.parent.getRelativePath()).toBe(tempPath());

			await fileDelete(new1.getRelativePath());
		});

		it('should fix extensions', async () => {
			spyOn(fileUtils, 'fileRename');

			const new1 = new FileGeneric('canon.JPG', tempPath());
			await new1.check();
			expect(fileUtils.fileRename).toHaveBeenCalledTimes(1);
			expect(new1.getFilename()).toBe('canon');
			expect(new1.getExtension()).toBe('.jpg');
		});

		it('should remove the file', async function() {
			const new1 = createFileGeneric('jh-patch-file-patch.txt');

			let filename = new1.getRelativePath();

			expect(await fileExists(filename)).toBeTruthy();
			await new1.remove();
			expect(await fileExists(filename)).toBeFalsy();
		});
	});

	it('should iterate', (done) => {
		let ff = new FileGeneric(path.join(dataPath(), 'test.txt'));

		ff.iterate(f => f.getFilename()).then((res) => {
			expect(res.length).toBe(1);
			expect(res[0]).toBe('test');
			done();
		});
	});
});
