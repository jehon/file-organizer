
const { dataPath, createFileGeneric } = require('./helpers.js');
const FileMovie = require('../../file-organizer/file-movie.js');
const fileFactory = require('../../file-organizer/file-factory.js');
const { tsFromString } = require('../../file-organizer/timestamp.js');

async function getMov(dPath) {
	return new FileMovie(dataPath(dPath)).loadData();
}

const canonMOV = 'DSC_2506.MOV';
const canonMOV_EXIV_TS = '2019:09:19 07:48:25';

const AndroidMP4 = '2019-09-03 12-48/20190903_124726.mp4';
const AndroidMP4_TS = '2019-09-03 12-47-31';
const AndroidMP4_EXIV_TS = '2019:09:03 10:47:31';

fdescribe('file-movie-test', () => {
	it('should get exiv from files', async () => {
		// Canon files
		let mov;
		mov =  await getMov(canonMOV);
		expect(mov.exiv_timestamp_raw).toBe(canonMOV_EXIV_TS);

		// Adroid files
		mov = await getMov(AndroidMP4);
		expect(mov.exiv_timestamp_raw).toBe(AndroidMP4_EXIV_TS);
		expect(mov.exiv_calculated_timezone).toBe('Europe/Brussels');
		expect(mov.exiv_timestamp.humanReadable()).toBe(AndroidMP4_TS);
	});

	it('should get comment from files', async () => {
		// Android files
		expect((await getMov(canonMOV)).exiv_comment).toBe('');
		expect((await getMov(AndroidMP4)).exiv_comment).toBe('');
	});

	it('should write timestamps correctly with MOV', async() =>  {
		const new1 = await createFileGeneric(canonMOV);
		expect(new1.exiv_timestamp.exiv()).toBe(canonMOV_EXIV_TS);

		await new1.exivWriteTimestamp(tsFromString('2016-02-04 01-02-03'));
		expect(new1.exiv_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

		const new2 = await fileFactory(new1.getPath());
		await new2.loadData();
		expect(new2.exiv_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

		new1.remove();
	});

	xit('should write timestamps correctly with MP4', async() =>  {
		const new1 = await createFileGeneric(AndroidMP4);
		expect(new1.exiv_timestamp.exiv()).toBe(AndroidMP4_EXIV_TS);

		await new1.exivWriteTimestamp(tsFromString('2016-02-04 01-02-03'));
		expect(new1.exiv_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

		const new2 = await createFileGeneric(AndroidMP4);
		expect(new2.exiv_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

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
