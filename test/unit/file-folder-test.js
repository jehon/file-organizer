
const { dataPath } = require('./helpers.js');
const FileFolder = require('../../file-organizer/file-folder.js');
const FileGeneric = require('../../file-organizer/file-generic.js');

describe('file-folder-test', () => {
	it('should pass on all files', async () => {
		const folder = new FileFolder(dataPath());
		let res = 0;
		for(const f of await folder.getList()) {
			expect(f).toEqual(jasmine.any(FileGeneric));
			expect(f.parent.getPath()).toBe(dataPath());
			expect(f.getFilename()).not.toBe('.');
			expect(f.getFilename()).not.toBe('..');

			// Hidden files
			expect(f.getFilename()).not.toBe('@eaDir');

			// Do we have ... (by 2^ bits)
			if (f.getFilename() == 'jh-patch-file-patch') {
				res += 2;
			}
		}
		expect(res).toBe(2);
	});
});
