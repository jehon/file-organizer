
const { dataPath, createFileGeneric } = require('./helpers.js');
const FilePicture = require('../../regularize/file-picture.js');
const { fileDelete } = require('../../file-utils.js');

// For mock
const FileTimestamped = require('../../regularize/file-timestamped.js');
const FileGeneric = require('../../regularize/file-generic.js');

describe('file-picture-test', () => {
	it('should get exiv from files', () => {
		expect((new FilePicture(dataPath('20150306_153340 Cable internet dans la rue.jpg'))).exivReadDate()).toBe('2015-03-06 15-33-40');
		expect((new FilePicture(dataPath('canon.JPG'))).exivReadDate()).toBe('2018-02-04 13-17-50');
		expect((new FilePicture(dataPath('petitAppPhoto.jpg'))).exivReadDate()).toBe('2020-01-19 01-24-02');

		expect(new FilePicture(dataPath('no_exiv.jpg')).exivReadDate()).toBeNull();
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

	// xit('should getDataTimestamp correctly', () => {
	// 	expect((new FilePicture(dataPath('20150306_153340 Cable internet dans la rue.jpg'))).getDataTimestamp().TS()).toBe('2015-03-06 15-33-40');
	// 	expect((new FilePicture(dataPath('canon.JPG'))).getDataTimestamp().TS()).toBe('2018-02-04 13-17-50');
	// 	expect((new FilePicture(dataPath('petitAppPhoto.jpg'))).getDataTimestamp().TS()).toBe('2020-01-19 01-24-02');

	// 	// No exiv
	// 	expect(() => (new FilePicture(dataPath('no_exiv.jpg'))).getDataTimestamp()).toThrowError(FilePicture.InvalidDataError);
	// });

	// xit('should calculate a canonicalFilename', () => {
	// 	// folder = data
	// 	expect((new FilePicture(dataPath('canon.JPG'))).getCanonicalFilename()).toBe('2018-02-04 13-17-50 canon');
	// 	expect((new FilePicture(dataPath('petitAppPhoto.jpg'))).getCanonicalFilename()).toBe('2020-01-19 01-24-02 petitAppPhoto');
	// });

	describe('check', () => {
		beforeEach(() => {
			spyOn(FileTimestamped.prototype, 'check').and.returnValue(true);
			spyOn(FileGeneric.prototype, 'checkMsg').and.callThrough();
		});

		it('should be problems when no exiv is present', async() => {
			const new1 = new FilePicture(dataPath('no_exiv.jpg'));
			await new1.check();
			expect(FileGeneric.prototype.checkMsg).toHaveBeenCalled();
		});

		it('should rotate pictures when necessary', async() => {
			const new1 = createFileGeneric('rotated-bottom-left.jpg');
			expect(new1.exivReadOrientation()).toBe(270);
			await new1.check();
			expect(FileGeneric.prototype.checkMsg).toHaveBeenCalled();
			expect(new1.exivReadOrientation()).toBe(0);
			new1.remove();
		});

		// xit('should set comment if necessary', async() => {
		// 	const new1 = createFileGeneric('no_exiv.jpg');
		// 	expect(new1.exivReadComment()).toBe('');
		// 	await new1.check();
		// 	expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(2);
		// 	expect(new1.exivReadComment()).toBe('no_exiv');
		// 	new1.remove();
		// });

		// xit('should force comment', async() => {
		// 	const new1 = createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
		// 	expect(new1.exivReadComment()).toBe('User comments');
		// 	await new1.check();
		// 	expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(2);
		// 	expect(new1.exivReadComment()).toBe('Cable internet dans la rue');
		// 	new1.remove();
		// });
	});
});
