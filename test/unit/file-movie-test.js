
const { dataPath, createFileGeneric } = require('./helpers.js');
const FileMovie = require('../../file-organizer/file-movie.js');
const fileFactory = require('../../file-organizer/file-factory.js');

async function getMov(dPath) {
	return new FileMovie(dataPath(dPath)).loadData();
}

const canonMOV = 'DSC_2506.MOV';
const canonMOVTS = '2019-09-19 07-48-25';

describe('file-movie-test', () => {
	it('should get exiv from files', async () => {
		// Adroid files
		expect((await getMov(canonMOV)).exiv_timestamp.TS()).toBe(canonMOVTS);
	});

	it('should get comment from files', async () => {
		// Android files
		expect((await getMov(canonMOV)).exiv_comment).toBe('');
	});

	it('should write timestamps correctly', async() =>  {
		const new1 = await createFileGeneric(canonMOV);
		expect(new1.exiv_timestamp.TS()).toBe(canonMOVTS);

		await new1.exivWriteTimestamp('2016-02-04 01-02-03');
		expect(new1.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		const new2 = await fileFactory(new1.getRelativePath());
		await new2.loadData();
		expect(new2.exiv_timestamp.TS()).toBe('2016-02-04 01-02-03');

		new1.remove();
	});

	it('should write comments correctly', async() =>  {
		const newComment = 'test';
		const new1 = await createFileGeneric(canonMOV);
		expect(new1.exiv_comment).toBe('');

		await new1.exivWriteComment(newComment);
		expect(new1.exiv_comment).toBe(newComment);

		const new2 = await fileFactory(new1.getRelativePath());
		await new2.loadData();
		expect(new2.exiv_comment).toBe(newComment);

		new1.remove();
	});

});
