
import { t } from '../test-helper.js';
import fs from 'fs';

import { createFileFrom, tempPath, dataPath } from './help-functions.mjs';
import FilePicture from '../../src/main/file-types/file-picture.js';
import FileTimestamped from '../../src/main/file-types/file-timestamped.js';
import FileExif from '../../src/main/file-types/file-exif.js';

import { tsFromExif } from '../../file-organizer/timestamp.js';

import File, { FOError } from '../../src/main/file-types/file.js';

/**
 * @param {string} baseFilename to be tested
 * @param {string} its_time to be checked
 * @param {string} its_title to be checked
 * @param {number} its_rotation to be checked
 * @param {function(File, Error): void} cb_check to check the file
 */
function testFullFlow(baseFilename, its_time, its_title, its_rotation = 0, cb_check = async () => { }) {
    describe(`with ${baseFilename}`, function () {
        it('should read data', async function () {
            const fo = await createFileFrom(baseFilename);
            let filename = fo.currentFilePath;


            try {
                let f;
                try {
                    f = new FilePicture(filename);
                    await f.runAnalyse();
                } catch (e) {
                    if (!(e instanceof FOError)) {
                        throw e;
                    }
                    await cb_check(f, e);
                }
                expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable())
                    .withContext(baseFilename)
                    .toBe(its_time);
                expect(f.get(FileTimestamped.I_ITS_TITLE).initial)
                    .withContext(baseFilename)
                    .toBe(its_title);
                expect(f.get(FileExif.I_FE_ORIENTATION).initial)
                    .withContext(baseFilename)
                    .toBe(its_rotation);
                filename = f.currentFilePath;
            } finally {
                await fs.promises.unlink(filename);
            }
        });

        it('should write data', async function () {
            const fo = await createFileFrom(baseFilename);
            let filename = fo.currentFilePath;
            try {
                {
                    const f = new FilePicture(filename);

                    try {
                        await f.runAnalyse();
                    } catch (e) {
                        if (!(e instanceof FOError)) {
                            throw e;
                        }
                    }

                    /**
                     * @param {string} str to be escaped
                     * @returns {string} escaped
                     */
                    const esc = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string


                    // Set some values
                    f.get(FileTimestamped.I_ITS_TITLE).expect('new title');
                    f.get(FileTimestamped.I_ITS_TIME).expect(tsFromExif('2020:01:02 02:03:04'));

                    await f.runActing();
                    filename = f.currentFilePath;
                    expect(f.currentFilePath)
                        .withContext(baseFilename)
                        .toMatch(new RegExp('^' + esc(tempPath('2020-01-02 02-03-04 new title'))));
                }

                {
                    // Create a new file, and see if it is ok
                    const f = new FilePicture(filename);

                    await f.runAnalyse();
                    filename = f.currentFilePath;
                    expect(f.get(FileTimestamped.I_ITS_TITLE).initial).toBe('new title');
                    expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe('2020-01-02 02-03-04');
                    expect(f.get(FileExif.I_FE_ORIENTATION).initial).toBe(0);
                }
            } catch (e) {
                if (!(e instanceof FOError)) {
                    throw e;
                }
                // console.log(e);
            } finally {
                await fs.promises.unlink(filename);
            }
        });

    });
}

describe(t(import.meta), function () {
    testFullFlow('no_exif.jpg', '', '');
    testFullFlow('20150306_153340 Cable internet dans la rue.jpg', '2015-03-06 15-33-40', 'User comments', 90);
    testFullFlow('canon.JPG', '2018-02-04 13-17-50', '');
    testFullFlow('petitAppPhoto.jpg', '2020-01-19 01-24-02', '');
    // testFullFlow('2019-09-03 12-48/20190903_124722.jpg', '2019-09-03 12-47-21', '', 90);

    it('should normalize extensions when necessary', async () => {
        const f = new FilePicture(dataPath('system_test/2019 test/1.jpeg'));
        try {
            await f.runAnalyse();
        } catch (e) {
            if (!(e instanceof FOError)) {
                throw e;
            }
        }
        expect(f.get(File.I_EXTENSION).expected).toBe('.jpg');
    });

    // xit('should get exif rotation from files', async () => {
    //     expect((await getPict('rotated.jpg')).exif_orientation).toBe(270);
    //     expect((await getPict('rotated-ok.jpg')).exif_orientation).toBe(0);
    //     expect((await getPict('rotated-bottom-left.jpg')).exif_orientation).toBe(270);
    //     expect((await getPict('rotated-right-top.jpg')).exif_orientation).toBe(90);

    //     expect((await getPict('petitAppPhoto.jpg')).exif_orientation).toBe(0);
    //     expect((await getPict('no_exif.jpg')).exif_orientation).toBe(0);
    // });

});
