
const options = require('../../file-organizer/options.js');

const { tempPath, createFileGeneric } = require('./helpers.js');
const FileFactory = require('../../file-organizer/file-factory.js');
const FileTimestamped = require('../../file-organizer/file-timestamped.js');
const FileFolder = require('../../file-organizer/file-folder.js');
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

		describe('should guess comment', () => {
			beforeEach(() => {
				options.guessComment = true;
			});

			afterEach(() => {
				options.resetToDefault();
			});

			it('should take the new comment from file', async () => {
				const new1 = createFileGeneric('1998-12-31 12-10-11 exivok01.jpg');
				new1.exivWriteComment('');

				// new2 is a virtual alias of new1 with fields initialized
				const new2 = FileFactory(new1.getRelativePath());
				expect(new2.getInfo('picture.exiv.comment')).toBe('');
				expect(new2.getInfo('timestamp.comment')).toBe('exivok01');

				await new2.check();
				expect(new2.exivReadComment()).toBe('exivok01');
				expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 exivok01');

				new2.remove();
			});

			it('should take the new comment from the folder', async () => {
				const new1 = createFileGeneric('1998-12-31 12-10-11 exivok01.jpg');
				new1.exivWriteComment('');
				await new1.changeFilename('1998-12-31 12-10-11');

				// new2 is a virtual alias of new1 with fields initialized
				const new2 = FileFactory(new1.getRelativePath());
				expect(new2.getInfo('picture.exiv.comment')).toBe('');
				expect(new2.getInfo('timestamp.comment')).toBe('');
				new2._parent = new FileFolder('1998 parent comment');
				expect(new2.parent.getInfo('timestamp.comment')).toBe('parent comment');

				await new2.check();
				// !! new2 is in a non-existant folder
				expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 parent comment');

				new1.remove();
			});

			it('should keep original comment', async () => {
				const new1 = createFileGeneric('1998-12-31 12-10-11 exivok01.jpg');
				new1.exivWriteComment('x test');

				// new2 is a virtual alias of new1 with fields initialized
				const new2 = FileFactory(new1.getRelativePath());
				expect(new2.exivReadComment()).toBe('x test');
				expect(new2.getInfo('picture.exiv.comment')).toBe('x test');

				await new2.check();
				expect(new2.exivReadComment()).toBe('x test');
				expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 x test');

				new2.remove();
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
