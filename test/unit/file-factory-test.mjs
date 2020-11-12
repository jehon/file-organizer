
import { t } from '../test-helper.js';

import { dataPath } from './help-functions.mjs';
import fileFactory from '../../file-organizer/file-factory.js';
import FileFolder from '../../file-organizer/file-folder.js';

// import File from '../../file-organizer/main/file.js';
import FileDelete from '../../file-organizer/main/file-delete.js';
// import FileGeneric from '../../file-organizer/file-generic.js';
import FileManual from '../../file-organizer/main/file-manual.js';
import FileHidden from '../../file-organizer/main/file-hidden.js';
import FileMovie from '../../file-organizer/file-movie.js';
import FilePicture from '../../file-organizer/file-picture.js';

describe(t(import.meta), function () {
    xit('should work for non-existing files', async () => {
        expect(await fileFactory('anything.doc')).toEqual(jasmine.any(FileManual));
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
