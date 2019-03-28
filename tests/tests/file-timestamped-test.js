
const { tempPath, createFileGeneric } = require('./helpers.js');
const FileTimestamped = require('../../file-organizer/file-timestamped.js');
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
		new3.setCalculatedTS(tsFromString('2018-01-02 03-04-05'));
		expect(new3.calculatedTS.TS()).toBe('2018-01-02 03-04-05');
	});

	it('should calculate a canonicalFilename', () => {
		expect((new FileTimestamped('2018-02-04')).getCanonicalFilename()).toBe('2018-02-04');
		expect((new FileTimestamped('2018-02-04 13-17-50 canon')).getCanonicalFilename()).toBe('2018-02-04 13-17-50 canon');
		expect((new FileTimestamped('2020-01-19 01-24-02 petitAppPhoto')).getCanonicalFilename()).toBe('2020-01-19 01-24-02 petitAppPhoto');
	});

	describe('check', () => {
		it('should parse original file', async () => {
			const new1 = new FileTimestamped('2015-05-26 11-37-24 vie de famille - VID_20120526_113724');
			expect(new1.filenameTS.year).toBe(2012);
			expect(new1.filenameTS.comment).toBe('vie de famille');
		});

		describe('should check coherence with parent folder', () => {
			it('should be ok when no file date and no folder date', async() => {
				// already ok: no file date and no folder date
				const new1 = new FileTimestamped(tempPath('canon.jpg'));
				await new1.check();
				expect(new1.errors).not.toContain('TS_PARENT_INCOHERENT');
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
				expect(new1.errors).not.toContain('TS_PARENT_INCOHERENT');
			});

			it('should be ok when file date and folder range date are coherent', async() => {
				const new1 = new FileTimestamped(tempPath('1996-2000 virtual', '1998-12-31 12-13-24 test.jpg'));
				await new1.check();
				expect(new1.errors).not.toContain('TS_PARENT_INCOHERENT');
			});

			it('should report when file and folder date incoherent', async () => {
				const new1 = new FileTimestamped(tempPath('1998-12-31 virtual', '1999-09-09 12-00-00 test.jpg'));
				await new1.check();
				expect(new1.errors).toContain('TS_PARENT_INCOHERENT');
			});
		});

		it('should detect duplicate files', async() => {
			const new1 = createFileGeneric('rotated-bottom-left.jpg');
			new1.calculatedTS.year = 2018;
			new1.calculatedTS.comment = 'duplicate test';
			await new1.check();

			const new2 = createFileGeneric('rotated-bottom-left.jpg');
			new2.calculatedTS = new1.calculatedTS;
			await new2.check();
			expect(new2.errors).toContain('TS_DUP_FILES');

			new1.remove();
			new2.remove();
		});

	});
});
