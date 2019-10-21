
const options = require('../../file-organizer/options.js');
const { dataPath, createFileGeneric } = require('./helpers.js');
const FilePicture = require('../../file-organizer/file-picture.js');

const { tsFromString } = require('../../file-organizer/timestamp.js');

async function getPict(dPath) {
	return new FilePicture(dataPath(dPath)).loadData();
}

describe('file-picture-test', () => {
	it('should get exiv from files', async () => {
		expect((await getPict('20150306_153340 Cable internet dans la rue.jpg')).exiv_timestamp.humanReadable()).toBe('2015-03-06 15-33-40');
		expect((await getPict('canon.JPG')).exiv_timestamp.humanReadable()).toBe('2018-02-04 13-17-50');
		expect((await getPict('petitAppPhoto.jpg')).exiv_timestamp.humanReadable()).toBe('2020-01-19 01-24-02');

		// Adroid files
		expect((await getPict('2019-09-03 12-48/20190903_124722.jpg')).exiv_timestamp.humanReadable()).toBe('2019-09-03 12-47-21');

		expect((await getPict('no_exiv.jpg')).exiv_timestamp.humanReadable()).toBe('');
	});

	it('should get exiv rotation from files', async () => {
		expect((await getPict('rotated.jpg')).exiv_orientation).toBe(270);
		expect((await getPict('rotated-ok.jpg')).exiv_orientation).toBe(0);
		expect((await getPict('rotated-bottom-left.jpg')).exiv_orientation).toBe(270);
		expect((await getPict('rotated-right-top.jpg')).exiv_orientation).toBe(90);

		expect((await getPict('petitAppPhoto.jpg')).exiv_orientation).toBe(0);
		expect((await getPict('no_exiv.jpg')).exiv_orientation).toBe(0);
	});

	it('should get comment from files', async () => {
		expect((await getPict('20150306_153340 Cable internet dans la rue.jpg')).exiv_comment).toBe('User comments');
		expect((await getPict('canon.JPG')).exiv_comment).toBe('');
		expect((await getPict('petitAppPhoto.jpg')).exiv_comment).toBe('');

		// Android files
		expect((await getPict('2019-09-03 12-48/20190903_124722.jpg')).exiv_comment).toBe('');

		expect((await getPict('no_exiv.jpg')).exiv_comment).toBe('');
	});

	it('should write timestamps correctly', async() =>  {
		const new1 = await createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
		expect(new1.exiv_timestamp.humanReadable()).toBe('2015-03-06 15-33-40');

		await new1.exivWriteTimestamp(tsFromString('2016-02-04 01-02-03'));
		expect(new1.exiv_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

		await new1.exivWriteTimestamp(tsFromString('2014-05-06'));
		expect(new1.exiv_timestamp.humanReadable()).toBe('2014-05-06');

		new1.remove();
	});

	it('should write comments correctly', async() =>  {
		const new1 = await createFileGeneric('20150306_153340 Cable internet dans la rue.jpg');
		expect(new1.exiv_comment).toBe('User comments');
		await new1.exivWriteComment('My new comment with àn accent');
		expect(new1.exiv_comment).toBe('My new comment with àn accent');
		new1.remove();

		const new2 = await createFileGeneric('canon.JPG');
		expect(new2.exiv_comment).toBe('');
		await new2.exivWriteComment('My other comment with àn accent');
		expect(new2.exiv_comment).toBe('My other comment with àn accent');
		new2.remove();
	});

	describe('check', () => {
		it('should be problems when no exiv is present', async() => {
			const new1 = await getPict('no_exiv.jpg');
			await new1.check();
			expect(Array.from(new1.messages.keys())).toContain('TS_NO_TIMESTAMP');
		});

		it('should rotate pictures when necessary', async() => {
			const new1 = await createFileGeneric('rotated-bottom-left.jpg');
			new1.exiv_timestamp = tsFromString('2018-01-02');
			new1.calculatedTS.moment.year(2018);
			new1.calculatedTS.comment = 'should rotate pictures when necessary';
			expect(new1.exiv_orientation).toBe(270);
			await new1.check();
			expect(Array.from(new1.messages.keys())).toContain('PICT_ROTATE');
			expect(new1.exiv_orientation).toBe(0);
			new1.remove();
		});

		it('should set comment if necessary', async() => {
			const new1 = await createFileGeneric('no_exiv.jpg');
			expect(new1.exiv_comment).toBe('');
			expect(new1.exiv_timestamp.humanReadable()).toBe('');

			new1.exiv_timestamp = tsFromString('2018-01-02');

			new1.calculatedTS.year = 2018;
			new1.calculatedTS.comment = 'override comment';

			await new1.check();
			expect(Array.from(new1.messages.keys())).toContain('EXIV_WRITE_COMMENT');
			expect(new1.exiv_comment).toBe('override comment');
			new1.remove();

			options.resetToDefault();
		});
	});
});
