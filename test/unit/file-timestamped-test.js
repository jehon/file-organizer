
const { basename } = require('path');

const { tempPath, createFileGeneric } = require('./helpers.js');
const fileFactory = require('../../file-organizer/file-factory.js');
const FileTimestamped = require('../../file-organizer/file-timestamped.js');
const FileFolder = require('../../file-organizer/file-folder.js');
const { tsFromString } = require('../../file-organizer/timestamp.js');
const { fileDelete } = require('../../file-organizer/file-utils.js');

describe(basename(__filename), () => {
    it('should get the timestamp', function () {
        const new1 = new FileTimestamped('20150306_153340 Cable internet dans la rue.jpg');
        expect(new1.calculatedTS.humanReadable()).toBe('2015-03-06 15-33-40');

        const new2 = new FileTimestamped('IMG_20150306_153340.jpg');
        expect(new2.calculatedTS.humanReadable()).toBe('2015-03-06 15-33-40');
    });

    it('should set calculated ts', () => {
        const new3 = new FileTimestamped('test [DSC00001].jpg');
        expect(new3.calculatedTS.humanReadable()).toBe('');
        new3.setCalculatedTS(tsFromString('2018-01-02 03-04-05'));
        expect(new3.calculatedTS.humanReadable()).toBe('2018-01-02 03-04-05');
    });

    it('should calculate a canonicalFilename', () => {
        expect((new FileTimestamped('2018-02-04')).getCanonicalFilename()).toBe('2018-02-04');
        expect((new FileTimestamped('2018-02-04 13-17-50 canon')).getCanonicalFilename()).toBe('2018-02-04 13-17-50 canon');
        expect((new FileTimestamped('2020-01-19 01-24-02 petitAppPhoto')).getCanonicalFilename()).toBe('2020-01-19 01-24-02 petitAppPhoto');
    });

    it('should find an indexed filename', async function () {
        const n1 = await createFileGeneric('canon.JPG');
        await n1.check();
        expect(await n1.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon');
        const n2 = new FileTimestamped(n1.getPath());

        await n1.changeFilename('2018-02-04 13-17-50 canon [test]');

        // Index when file already exists
        n2.calculatedTS.original = 'test';
        expect(await n2.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon [1]');

        // Skip numerical 'original' which should be indexes
        n1.calculatedTS.original = '123';
        expect(await n1.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon');

        await fileDelete(n1.getPath());
    });

    describe('check', () => {
        it('should parse original file', async () => {
            const new1 = new FileTimestamped('2015-05-26 11-37-24 vie de famille [VID_20120526_113724]');
            expect(new1.filenameTS.moment.year()).toBe(2012);
            expect(new1.filenameTS.title).toBe('vie de famille');
        });

        describe('should check coherence with parent folder', () => {
            it('should be ok when no file date and no folder date', async () => {
                // already ok: no file date and no folder date
                const new1 = new FileTimestamped(tempPath('canon.jpg'));
                await new1.check();
                expect(Array.from(new1.messages.keys())).not.toContain('TS_PARENT_INCOHERENT');
            });

            // it('should be ko when no file date and with folder date', async() => {
            // 	const new1 = new FileTimestamped(tempPath('1998-12-31 virtual', 'canon.jpg'));
            // 	await new1.check();
            // 	expect(FileGeneric.prototype.checkMsg).toHaveBeenCalledTimes(1);
            // 	expect(FileGeneric.prototype.check).toHaveBeenCalledTimes(1);
            // });

            it('should be ok when file date and folder date are coherent', async () => {
                const new1 = new FileTimestamped(tempPath('1998-12-31 virtual', '1998-12-31 12-13-24 test.jpg'));
                await new1.check();
                expect(Array.from(new1.messages.keys())).not.toContain('TS_PARENT_INCOHERENT');
            });

            it('should be ok when file date and folder range date are coherent', async () => {
                const new1 = new FileTimestamped(tempPath('1996-2000 virtual', '1998-12-31 12-13-24 test.jpg'));
                await new1.check();
                expect(Array.from(new1.messages.keys())).not.toContain('TS_PARENT_INCOHERENT');
            });

            it('should report when file and folder date incoherent', async () => {
                const new1 = new FileTimestamped(tempPath('1998-12-31 virtual', '1999-09-09 12-00-00 test.jpg'));
                await new1.check();
                expect(Array.from(new1.messages.keys())).toContain('TS_PARENT_INCOHERENT');
            });
        });

        describe('should guess title', () => {
            it('should take the new title from file', async () => {
                const new1 = await createFileGeneric('1998-12-31 12-10-11 exifok01.jpg');
                await new1.exifWriteTitle('');

                // new2 is a virtual alias of new1 with fields initialized
                const new2 = await fileFactory(new1.getPath());
                await new2.loadData();
                expect(new2.exif_title).toBe('');
                expect(new2.filenameTS.title).toBe('exifok01');

                await new2.check();
                await new2.exifReload();
                expect(new2.exif_title).toBe('exifok01');
                expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 exifok01');

                new2.remove();
            });

            it('should take the new title from the folder', async () => {
                const new1 = await createFileGeneric('1998-12-31 12-10-11 exifok01.jpg');
                await new1.exifWriteTitle('');
                await new1.changeFilename('1998-12-31 12-10-11');

                // new2 is a virtual alias of new1 with fields initialized
                const new2 = await fileFactory(new1.getPath());
                await new2.loadData();
                expect(new2.exif_title).toBe('');
                expect(new2.filenameTS.title).toBe('');
                new2._parent = new FileFolder('1998 parent title');
                expect(new2.parent.filenameTS.title).toBe('parent title');

                try {
                    // TODO(cleanup): this check lead to a lot of error
                    // const fs = require('fs');
                    // spyOn(fs.promises, 'rename').and.returnValue(Promise.resolve(true));
                    // spyOn(spawn-promise, '?').and.returnValue(Promise.resolve(true));
                    await new2.check();
                } catch (_e) {
                    // expected
                }
                // !! new2 is in a non-existant folder
                expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 parent title');

                new1.remove();
            });

            it('should keep original title', async () => {
                const new1 = await createFileGeneric('1998-12-31 12-10-11 exifok01.jpg');
                await new1.exifWriteTitle('x test');

                // new2 is a virtual alias of new1 with fields initialized
                const new2 = await fileFactory(new1.getPath());
                await new2.loadData();
                expect(new2.exif_title).toBe('x test');

                await new2.check();
                await new2.exifReload();
                expect(new2.exif_title).toBe('x test');
                expect(new2.getCanonicalFilename()).toBe('1998-12-31 12-10-11 x test');

                new2.remove();
            });

        });
    });
});
