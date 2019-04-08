
const options = require('../../file-organizer/options.js');
const { dataPath, createFileGeneric } = require('./helpers.js');
const FilePicture = require('../../file-organizer/file-picture.js');

describe('file-picture-test', () => {
	it('should get exiv from files', () => {
		expect((new FilePicture(dataPath('20150306_153340 Cable internet dans la rue.jpg'))).exivReadTimestamp()).toBe('2015-03-06 15-33-40');
		expect((new FilePicture(dataPath('canon.JPG'))).exivReadTimestamp()).toBe('2018-02-04 13-17-50');
		expect((new FilePicture(dataPath('petitAppPhoto.jpg'))).exivReadTimestamp()).toBe('2020-01-19 01-24-02');

		expect(new FilePicture(dataPath('no_exiv.jpg')).exivReadTimestamp()).toBeNull();
	});

	it('should get exiv rotation from files', () => {
		expect((new FilePicture(dataPath('rotated.jpg'))).exivReadOrientation()).toBe(270);
		expect((new FilePicture(dataPath('rotated-ok.jpg'))).exivReadOrientation()).toBe(0);
		expect((new FilePicture(dataPath('rotated-bottom-left.jpg'))).exivReadOrientation()).toBe(270);
		expect((new FilePicture(dataPath('rotated-right-top.jpg'))).exivReadOrientation()).toBe(90);

		expect((new FilePicture(dataPath('petitAppPhoto.jpg'))).exivReadOrientation()).toBe(0);
		expect(new FilePicture(dataPath('no_exiv.jpg')).exivReadOrientation()).toBe(0);
	});

	it('should get comment from files', () => {
		expect((new FilePicture(dataPath('20150306_153340 Cable internet dans la rue.jpg'))).exivReadComment()).toBe('User comments');
		expect((new FilePicture(dataPath('canon.JPG'))).exivReadComment()).toBe('');
		expect((new FilePicture(dataPath('petitAppPhoto.jpg'))).exivReadComment()).toBe('');

		expect(new FilePicture(dataPath('no_exiv.jpg')).exivReadComment()).toBe('');
	});

	it('should write timestamps correctly', async() =>  {
		const new1 = createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
		expect(new1.exivReadTimestamp()).toBe('2015-03-06 15-33-40');

		new1.exivWriteTimestamp('2016-02-04 01-02-03');
		expect(new1.exivReadTimestamp()).toBe('2016-02-04 01-02-03');

		new1.exivWriteTimestamp('2014-05-06');
		expect(new1.exivReadTimestamp()).toBe('2014-05-06 00-00-00');

		new1.remove();
	});

	it('should write comments correctly', async() =>  {
		const new1 = createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
		expect(new1.exivReadComment()).toBe('User comments');
		new1.exivWriteComment('My new comment with àn accent');
		expect(new1.exivReadComment()).toBe('My new comment with àn accent');
		new1.remove();

		const new2 = createFileGeneric('canon.JPG');
		expect(new2.exivReadComment()).toBe('');
		new2.exivWriteComment('My other comment with àn accent');
		expect(new2.exivReadComment()).toBe('My other comment with àn accent');
		new2.remove();
	});

	describe('check', () => {
		it('should be problems when no exiv is present', async() => {
			const new1 = new FilePicture(dataPath('no_exiv.jpg'));
			await new1.check();
			expect(new1.errors).toContain('PICT_NO_DATE');
		});

		it('should rotate pictures when necessary', async() => {
			const new1 = createFileGeneric('rotated-bottom-left.jpg');
			new1.exiv_timestamp = '2018-01-02';
			new1.calculatedTS.year = 2018;
			new1.calculatedTS.comment = 'should rotate pictures when necessary';
			expect(new1.exivReadOrientation()).toBe(270);
			await new1.check();
			expect(new1.errors).toContain('PICT_ROTATE');
			expect(new1.exivReadOrientation()).toBe(0);
			new1.remove();
		});

		it('should set comment if necessary', async() => {
			options.guessComment = true;

			const new1 = createFileGeneric('no_exiv.jpg');
			expect(new1.exivReadComment()).toBe('');
			expect(new1.exivReadTimestamp()).toBeNull();

			new1.exiv_timestamp = '2018-01-02';

			new1.calculatedTS.year = 2018;
			new1.calculatedTS.comment = 'override comment';

			await new1.check();
			expect(new1.errors).toContain('PICT_WRITE_COMMENT');
			expect(new1.exivReadComment()).toBe('override comment');
			new1.remove();

			options.resetToDefault();
		});

		// xit('should force comment', async() => {
		// 	const new1 = createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
		// 	expect(new1.exivReadComment()).toBe('User comments');
		// 	await new1.check();
		// expect(new1.errors).toContain("PICT_WRITE_COMMENT");
		// 	expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(2);
		// 	expect(new1.exivReadComment()).toBe('Cable internet dans la rue');
		// 	new1.remove();
		// });
	});
});
