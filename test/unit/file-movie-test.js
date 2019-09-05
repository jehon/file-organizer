
const options = require('../../file-organizer/options.js');
const { dataPath, createFileGeneric } = require('./helpers.js');
const FileMovie = require('../../file-organizer/file-movie.js');

const { tsFromString } = require('../../file-organizer/timestamp.js');

async function getMov(dPath) {
	return new FileMovie(dataPath(dPath)).loadData();
}

const AndroidMP4 = '2019-09-03 12-48/20190903_124726.mp4';

describe('file-movie-test', () => {
	it('should get exiv from files', async () => {
		// Adroid files
		expect((await getMov(AndroidMP4)).exiv_timestamp.TS()).toBe('2019-09-03 12-47-31');
	});

	it('should get comment from files', async () => {
		// Android files
		expect((await getMov(AndroidMP4)).exiv_comment).toBe('');
	});

	xit('should write timestamps correctly', async() =>  {
		const new1 = await createFileGeneric(AndroidMP4);
		expect(new1.exiv_timestamp.TS()).toBe('2019-09-03 12-47-31');

		new1.exivWriteTimestamp('2016-02-04 01-02-03');
		expect(new1.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		const new2 = await createFileGeneric(AndroidMP4);
		expect(new2.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		new1.remove();
	});

	describe('check', () => {
		xit('should be problems when no exiv is present', async() => {
			const new1 = await getMov('no_exiv.jpg');
			await new1.check();
			expect(new1.errors).toContain('EXIV_NO_DATE');
		});

		xit('should set comment if necessary', async() => {
			options.guessComment = true;

			// const new1 = await createFileGeneric('no_exiv.jpg');
			// expect(new1.exiv_comment).toBe('');
			// expect(new1.exiv_timestamp.TS()).toBe('');

			// new1.exiv_timestamp = tsFromString('2018-01-02');

			// new1.calculatedTS.year = 2018;
			// new1.calculatedTS.comment = 'override comment';

			// await new1.check();
			// expect(new1.errors).toContain('EXIV_WRITE_COMMENT');
			// expect(new1.exiv_comment).toBe('override comment');
			// new1.remove();

			options.resetToDefault();
		});
	});
});
