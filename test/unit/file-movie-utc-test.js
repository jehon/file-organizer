
const { dataPath, createFileGeneric } = require('./helpers.js');
const FileMovieUTC = require('../../file-organizer/file-movie-utc.js');

async function getMov(dPath) {
	return new FileMovieUTC(dataPath(dPath)).loadData();
}

const AndroidMP4 = '2019-09-03 12-48/20190903_124726.mp4';

describe('file-movie-utc-test', () => {
	it('should get exiv from files', async () => {
		// Adroid files
		expect((await getMov(AndroidMP4)).exiv_timestamp.TS()).toBe('2019-09-03 12-47-31');
	});

	it('should get comment from files', async () => {
		// Android files
		expect((await getMov(AndroidMP4)).exiv_comment).toBe('');
	});

	it('should write timestamps correctly', async() =>  {
		pending('MP4 write exiv is not developped');

		const new1 = await createFileGeneric(AndroidMP4);
		expect(new1.exiv_timestamp.TS()).toBe('2019-09-03 12-47-31');

		await new1.exivWriteTimestamp('2016-02-04 01-02-03');
		expect(new1.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		const new2 = await createFileGeneric(AndroidMP4);
		expect(new2.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		new1.remove();
	});
});
