
import { t } from '../test-helper.js';
import fs from 'fs';

import { createFileFrom, tempPath, dataPath } from './help-functions.mjs';
import FilePicture from '../../src/main/file-types/file-picture.js';
import FileTimestamped from '../../src/main/file-types/file-timestamped.js';
import FileExif, { exif2ts } from '../../src/main/file-types/file-exif.js';

import File, { FOError } from '../../src/main/file-types/file.js';

/**
 * @param {string} baseFilename to be tested
 * @param {string} its_time to be checked
 * @param {string} its_title to be checked
 * @param {number} its_rotation to be checked
 */
function testFullFlow(baseFilename, its_time, its_title, its_rotation = 0) {
    describe(`with ${baseFilename}`, function () {
        it('should read data', async function () {
            let filename = await createFileFrom(baseFilename);

            try {
                let f;
                f = new FilePicture(filename);
                await f.runAnalyse();
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
            let filename = await createFileFrom(baseFilename);
            try {
                {
                    const f = new FilePicture(filename);

                    await f.runAnalyse();
                    try {
                        f.runConsistencyCheck();
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
                    f.get(FileTimestamped.I_ITS_TIME).expect(exif2ts('2020:01:02 02:03:04'));

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
        await f.runAnalyse();
        expect(f.get(File.I_EXTENSION).expected).toBe('.jpg');
    });

    describe('should get exif rotation from files', () => {
        const testRotation = function (fn, angle) {
            it(`${fn} with ${angle}`, async () => {
                const f = new FilePicture(dataPath(fn));
                await f.runAnalyse();
                expect(f.get(FileExif.I_FE_ORIENTATION).initial).toBe(angle);
            });
        };

        testRotation('rotated.jpg', 270);
        testRotation('rotated-ok.jpg', 0);
        testRotation('rotated-bottom-left.jpg', 270);
        testRotation('rotated-right-top.jpg', 90);
        testRotation('petitAppPhoto.jpg', 0);
        testRotation('no_exif.jpg', 0);
    });
});
