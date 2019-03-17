
const { tempPath } = require('./helpers.js');
const FileTimestamped = require('../../file-organizer/file-timestamped.js');
const FileGeneric = require('../../file-organizer/file-generic.js');
const { tsFromString } = require('../../file-organizer/timestamp.js');

describe('file-timestamped-test', () => {
	it('should get the timestamp', function() {
		const new1 = new FileTimestamped('20150306_153340 Cable internet dans la rue.jpg');
		expect(new1.calculatedTS.TS()).toBe('2015-03-06 15-33-40');

		const new2 = new FileTimestamped('IMG_20150306_153340.jpg');
		expect(new2.calculatedTS.TS()).toBe('2015-03-06 15-33-40');
	});

	it('should set calculated ts', () => {
		const new3 = new FileTimestamped('test [DSC00001].jpg');
		expect(new3.calculatedTS.TS()).toBe('');
		new3.setCalculatedTSToIfMatching(tsFromString('2018-01-02 03-04-05'));
		expect(new3.calculatedTS.TS()).toBe('2018-01-02 03-04-05');
	});

	it('should calculate a canonicalFilename', () => {
		expect((new FileTimestamped('2018-02-04')).getCanonicalFilename()).toBe('2018-02-04');
		expect((new FileTimestamped('2018-02-04 13-17-50 canon')).getCanonicalFilename()).toBe('2018-02-04 13-17-50 canon');
		expect((new FileTimestamped('2020-01-19 01-24-02 petitAppPhoto')).getCanonicalFilename()).toBe('2020-01-19 01-24-02 petitAppPhoto');
	});

	describe('check', () => {
		beforeEach(() => {
			spyOn(FileGeneric.prototype, 'check').and.returnValue(true);
			spyOn(FileGeneric.prototype, 'checkMsg').and.callThrough();
		});

		describe('should check coherence with parent folder', () => {
			it('should be ok when no file date and no folder date', async() => {
				// already ok: no file date and no folder date
				const new1 = new FileTimestamped(tempPath('canon.jpg'));
				await new1.check();
				expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(0);
				expect(FileGeneric.prototype.check).toHaveBeenCalledTimes(1);
			});

			// it('should be ko when no file date and with folder date', async() => {
			// 	const new1 = new FileTimestamped(tempPath('1998-12-31 virtual', 'canon.jpg'));
			// 	await new1.check();
			// 	expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(1);
			// 	expect(FileGeneric.prototype.check).toHaveBeenCalledTimes(1);
			// });

			it('should be ok when file date and folder date are coherent', async() => {
				const new1 = new FileTimestamped(tempPath('1998-12-31 virtual', '1998-12-31 12-13-24 test.jpg'));
				await new1.check();
				expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(0);
				expect(FileGeneric.prototype.check).toHaveBeenCalledTimes(1);
			});

			it('should be ok when file date and folder range date are coherent', async() => {
				const new1 = new FileTimestamped(tempPath('1996-2000 virtual', '1998-12-31 12-13-24 test.jpg'));
				await new1.check();
				expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(0);
				expect(FileGeneric.prototype.check).toHaveBeenCalledTimes(1);
			});

			it('should report when file and folder date incoherent', async () => {
				const new1 = new FileTimestamped(tempPath('1998-12-31 virtual', '1999-09-09 12-00-00 test.jpg'));
				await new1.check();
				expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(1);
				expect(FileGeneric.prototype.check).toHaveBeenCalledTimes(1);
			});
		});
	});
});
