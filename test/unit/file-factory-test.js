
const { dataPath } = require('./helpers.js');
const FileFactory = require('../../file-organizer/file-factory.js');
const FileFolder  = require('../../file-organizer/file-folder.js');

const FileDelete  = require('../../file-organizer/file-delete.js');
const FileGeneric = require('../../file-organizer/file-generic.js');
const FileHidden  = require('../../file-organizer/file-hidden.js');
const FileMovie   = require('../../file-organizer/file-movie.js');
const FilePicture = require('../../file-organizer/file-picture.js');

describe('file-factory-test', () => {
	it('should work for non-existing files', () => {
		expect(FileFactory('anything')).toEqual(jasmine.any(FileGeneric));
	});

	it('should give the correct type for folders', () => {
		expect(FileFactory('.')).toEqual(jasmine.any(FileFolder));
		expect(FileFactory(dataPath())).toEqual(jasmine.any(FileFolder));
	});

	it('should give the correct type for delete', () => {
		expect(FileFactory('.picasa.ini')).toEqual(jasmine.any(FileDelete));
		expect(FileFactory('Thumbs.db')).toEqual(jasmine.any(FileDelete));
	});

	it('should give the correct type for hidden', () => {
		expect(FileFactory('@eaDir')).toEqual(jasmine.any(FileHidden));
	});

	it('should give the correct type for images', () => {
		expect(FileFactory('test.JPG')).toEqual(jasmine.any(FilePicture));
		expect(FileFactory('test.jpg')).toEqual(jasmine.any(FilePicture));
		expect(FileFactory('test.jpeg')).toEqual(jasmine.any(FilePicture));
	});

	it('should give the correct type for movies', () => {
		expect(FileFactory('test.m4v')).toEqual(jasmine.any(FileMovie));
		expect(FileFactory('test.MOV')).toEqual(jasmine.any(FileMovie));
		expect(FileFactory('test.mov')).toEqual(jasmine.any(FileMovie));
	});
});
