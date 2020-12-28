
import { t } from './help-functions.mjs';
import fs from 'fs';

import FileMovie from '../../src/main/file-types/file-movie.js';

import FileTimestamped from '../../src/main/file-types/file-timestamped.js';
import { createFileFrom, tempPath } from './help-functions.mjs';
import { exif2ts } from '../../src/main/file-types/file-exif.js';

/**
 * @param {string} title to describe the test
 * @param {string} baseFilename to be tested
 * @param {string} its_time - timestamp to be checked
 * @param {string} its_title - title to be checked
 */
function testFullFlow(title, baseFilename, its_time, its_title) {
    describe(`with ${title}`, function () {

        it('should read data', async () => {
            let filename = await createFileFrom(baseFilename);

            try {
                const f = new FileMovie(filename);
                await f.runAnalyse();

                expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable())
                    .withContext(baseFilename)
                    .toBe(its_time);
                expect(f.get(FileTimestamped.I_ITS_TITLE).initial)
                    .withContext(baseFilename)
                    .toBe(its_title);
                filename = f.currentFilePath;
            } finally {
                await fs.promises.unlink(filename);
            }
        });

        it('should write data', async () => {
            let filename = await createFileFrom(baseFilename);
            try {
                {
                    const f = new FileMovie(filename);

                    await f.runAnalyse();
                    f.runConsistencyCheck();

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
                        .toMatch(new RegExp('^' + esc(tempPath('2020-01-02 02-03-04 new title ['))));
                }

                {
                    // Create a new file, and see if it is ok
                    const f = new FileMovie(filename);

                    await f.runAnalyse();
                    expect(f.get(FileTimestamped.I_ITS_TITLE).initial)
                        .withContext(baseFilename)
                        .toBe('new title');
                    expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable())
                        .withContext(baseFilename)
                        .toBe('2020-01-02 02-03-04');
                }
            } finally {
                await fs.promises.unlink(filename);
            }
        });
    });
}

describe(t(import.meta), function () {

    //   internal TS is '2019:09:19 07:48:25';
    // Canon MOV
    testFullFlow('canon mov', 'DSC_2506.MOV', '2019-09-19 07-48-25', '');

    // Android MP4
    testFullFlow('android mp4', '2019-09-03 12-48/20190903_124726.mp4', '2019-09-03 12-47-31', '');
});