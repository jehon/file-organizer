
const { dataPath } = require('./helpers.js');
const fileFactory = require('../../file-organizer/file-factory.js');
const FileFolder = require('../../file-organizer/file-folder.js');

const FileDelete = require('../../file-organizer/file-delete.js');
const FileGeneric = require('../../file-organizer/file-generic.js');
const FileHidden = require('../../file-organizer/main/file-hidden.js');
const FileMovie = require('../../file-organizer/file-movie.js');
const FilePicture = require('../../file-organizer/file-picture.js');

describe('file-factory-test', () => {
    it('should work for non-existing files', async () => {
        expect(await fileFactory('anything')).toEqual(jasmine.any(FileGeneric));
    });

    it('should give the correct type for folders', async () => {
        expect(await fileFactory('.')).toEqual(jasmine.any(FileFolder));
        expect(await fileFactory(dataPath())).toEqual(jasmine.any(FileFolder));
    });

    it('should give the correct type for delete', async () => {
        expect(await fileFactory('.picasa.ini')).toEqual(jasmine.any(FileDelete));
        expect(await fileFactory('Thumbs.db')).toEqual(jasmine.any(FileDelete));
    });

    it('should give the correct type for hidden', async () => {
        expect(await fileFactory('@eaDir')).toEqual(jasmine.any(FileHidden));
    });

    it('should give the correct type for images', async () => {
        expect(await fileFactory('test.JPG')).toEqual(jasmine.any(FilePicture));
        expect(await fileFactory('test.jpg')).toEqual(jasmine.any(FilePicture));
        expect(await fileFactory('test.jpeg')).toEqual(jasmine.any(FilePicture));
    });

    it('should give the correct type for movies', async () => {
        // expect(await fileFactory('test.m4v')).toEqual(jasmine.any(FileMovie));
        expect(await fileFactory('test.MOV')).toEqual(jasmine.any(FileMovie));
        expect(await fileFactory('test.mov')).toEqual(jasmine.any(FileMovie));
    });
});
