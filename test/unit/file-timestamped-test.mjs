
import { t } from '../test-helper.js';
import fs from 'fs';
import path from 'path';

import File, { FOError } from '../../src/main/file-types/file.js';
import FileTimestamped from '../../src/main/file-types/file-timestamped.js';
// import '../../src/main/file-types/file-folder.js';

// import options from '../../file-organizer/options.js';

import {
    // listenForItemNotify,
    // getStatusChangesForItem,
    // createFileFrom,
    // fileExists,
    tempPath
} from './help-functions.mjs';


/**
 * @param {File} file whose parents need to be created
 */
function mkParentFolder(file) {
    fs.mkdirSync(path.dirname(file._path), { recursive: true });
}

describe(t(import.meta), function () {
    xit('should find an indexed filename', async function () {
        //         const n1 = await createFileGeneric('canon.JPG');
        //         await n1.check();
        //         expect(await n1.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon');
        //         const n2 = new FileTimestamped(n1.getPath());

        //         await n1.changeFilename('2018-02-04 13-17-50 canon [test]');

        //         // Index when file already exists
        //         n2.calculatedTS.original = 'test';
        //         expect(await n2.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon [1]');

        //         // Skip numerical 'original' which should be indexes
        //         n1.calculatedTS.original = '123';
        //         expect(await n1.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon');

        //         await fileDelete(n1.getPath());
    });

    describe('should check coherence with parent folder', () => {
        it('should be ok when file date and folder date are coherent', async () => {
            const f = new FileTimestamped(tempPath('1998-12-31 virtual', '1998-12-31 12-13-24 test.jpg'));
            mkParentFolder(f);
            await f.parent.runAnalyse();
            await f.runAnalyse();
            expect(f.hasProblem(FileTimestamped.P_TS_INCOHERENT)).toBeFalse();
        });

        it('should be ok when file date and folder range date are coherent', async () => {
            const f = new FileTimestamped(tempPath('1996-2000 virtual', '1998-12-31 12-13-24 test.jpg'));
            mkParentFolder(f);
            await f.parent.runAnalyse();
            await f.runAnalyse();
            expect(f.hasProblem(FileTimestamped.P_TS_INCOHERENT)).toBeFalse();
        });

        it('should report when file and folder date incoherent', async () => {
            const f = new FileTimestamped(tempPath('1998-12-31 virtual', '1999-09-09 12-00-00 test.jpg'));
            mkParentFolder(f);
            await f.parent.runAnalyse();
            try {
                await f.runAnalyse();
                throw 'It should throw';
            } catch (e) {
                if (!(e instanceof FOError)) {
                    throw e;
                }
                expect(f.hasProblem(FileTimestamped.P_TS_INCOHERENT)).toBeTrue();
            }
        });
    });

    describe('should guess title', () => {
        xit('should take the new title from file', async () => {
            //                 const new1 = await createFileGeneric('1998-12-31 12-10-11 exifok01.jpg');
            //                 await new1.exifWriteTitle('');

            //                 // new2 is a virtual alias of new1 with fields initialized
            //                 const new2 = await buildFile(new1.getPath());
            //                 await new2.loadData();
            //                 expect(new2.exif_title).toBe('');
            //                 expect(new2.filenameTS.title).toBe('exifok01');

            //                 await new2.check();
            //                 await new2.exifReload();
            //                 expect(new2.exif_title).toBe('exifok01');
            //                 expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 exifok01');

            //                 new2.remove();
        });

        xit('should take the new title from the folder', async () => {
            //                 const new1 = await createFileGeneric('1998-12-31 12-10-11 exifok01.jpg');
            //                 await new1.exifWriteTitle('');
            //                 await new1.changeFilename('1998-12-31 12-10-11');

            //                 // new2 is a virtual alias of new1 with fields initialized
            //                 const new2 = await buildFile(new1.getPath());
            //                 await new2.loadData();
            //                 expect(new2.exif_title).toBe('');
            //                 expect(new2.filenameTS.title).toBe('');
            //                 new2._parent = new FileFolder('1998 parent title');
            //                 expect(new2.parent.filenameTS.title).toBe('parent title');

            //                 try {
            //                     // TODO(cleanup): this check lead to a lot of error
            //                     // import fs from 'fs';
            //                     // spyOn(fs.promises, 'rename').and.returnValue(Promise.resolve(true));
            //                     // spyOn(spawn-promise, '?').and.returnValue(Promise.resolve(true));
            //                     await new2.check();
            //                 } catch (_e) {
            //                     // expected
            //                 }
            //                 // !! new2 is in a non-existant folder
            //                 expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 parent title');

            //                 new1.remove();
        });

        xit('should keep original title', async () => {
            //                 const new1 = await createFileGeneric('1998-12-31 12-10-11 exifok01.jpg');
            //                 await new1.exifWriteTitle('x test');

            //                 // new2 is a virtual alias of new1 with fields initialized
            //                 const new2 = await buildFile(new1.getPath());
            //                 await new2.loadData();
            //                 expect(new2.exif_title).toBe('x test');

            //                 await new2.check();
            //                 await new2.exifReload();
            //                 expect(new2.exif_title).toBe('x test');
            //                 expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 x test');

            //                 new2.remove();
        });
    });
});
