
const { dataPath, createFileGeneric } = require('./helpers.js');
const FileMovie = require('../../file-organizer/file-movie.js');
const fileFactory = require('../../file-organizer/file-factory.js');
const { tsFromString } = require('../../file-organizer/timestamp.js');

async function getMov(dPath) {
	return new FileMovie(dataPath(dPath)).loadData();
}

const canonMOV = 'DSC_2506.MOV';
const canonMOV_TS = '2019-09-19 07-48-25';
const AndroidMP4 = '2019-09-03 12-48/20190903_124726.mp4';
const AndroidMP4_TS = '2019-09-03 12-47-31';

describe('file-movie-test', () => {
	it('should get exiv from files', async () => {
		// Adroid files
		expect((await getMov(canonMOV)).exiv_timestamp.TS()).toBe(canonMOV_TS);
		expect((await getMov(AndroidMP4)).exiv_timestamp.TS()).toBe(AndroidMP4_TS);
	});

	it('should get comment from files', async () => {
		// Android files
		expect((await getMov(canonMOV)).exiv_comment).toBe('');
		expect((await getMov(AndroidMP4)).exiv_comment).toBe('');
	});

	it('should write timestamps correctly with MOV', async() =>  {
		const new1 = await createFileGeneric(canonMOV);
		expect(new1.exiv_timestamp.TS()).toBe(canonMOV_TS);

		await new1.exivWriteTimestamp(tsFromString('2016-02-04 01-02-03'));
		expect(new1.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		const new2 = await fileFactory(new1.getPath());
		await new2.loadData();
		expect(new2.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		new1.remove();
	});

	it('should write timestamps correctly with MP4', async() =>  {
		const new1 = await createFileGeneric(AndroidMP4);
		expect(new1.exiv_timestamp.TS()).toBe(AndroidMP4_TS);

		pending('MP4 write exiv is not developped');

		await new1.exivWriteTimestamp(tsFromString('2016-02-04 01-02-03'));
		expect(new1.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		const new2 = await createFileGeneric(AndroidMP4);
		expect(new2.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		new1.remove();
	});


	it('should write comments correctly', async() =>  {
		const newComment = 'test';
		const new1 = await createFileGeneric(canonMOV);
		expect(new1.exiv_comment).toBe('');

		await new1.exivWriteComment(newComment);
		expect(new1.exiv_comment).toBe(newComment);

		const new2 = await fileFactory(new1.getPath());
		await new2.loadData();
		expect(new2.exiv_comment).toBe(newComment);

		new1.remove();
	});

});
