
const fs = require('fs');

const { dataPath, tempPath, createFileGeneric } = require('./helpers.js');

describe('helpers-test', function() {
	it('should have a data path', function() {
		expect(fs.existsSync(dataPath())).toBeTruthy();
		expect(fs.existsSync(dataPath('..', 'data'))).toBeTruthy();
	});

	it('should create temp generic file', async () => {
		const new1 = await createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
		expect(new1.getFilename()).toBe('20150306_153340 Cable internet dans la rue');
		expect(new1.parent.getRelativePath()).toBe(tempPath());
		fs.unlinkSync(new1.getRelativePath());
	});
});
