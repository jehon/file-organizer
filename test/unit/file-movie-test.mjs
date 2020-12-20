
import { t } from '../test-helper.js';
import fs from 'fs';

import FileMovie from '../../src/main/file-types/file-movie.js';
import { tsFromExif } from '../../file-organizer/timestamp.js';

import FileTimestamped from '../../src/main/file-types/file-timestamped.js';
import { createFileFrom, tempPath } from './help-functions.mjs';

/**
 * @param {string} title to describe the test
 * @param {string} baseFilename to be tested
 * @param {string} its_time - timestamp to be checked
 * @param {string} its_title - title to be checked
 */
function testFullFlow(title, baseFilename, its_time, its_title) {
    describe(`with ${title}`, function () {

        it('should read data', async () => {
            // Canon files
            const fo = await createFileFrom(baseFilename);
            let filename = fo.currentFilePath;

            try {
                const f = new FileMovie(filename);
                await f.runAnalyse();

                expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe(its_time);
                expect(f.get(FileTimestamped.I_ITS_TITLE).initial).toBe(its_title);
                filename = f.currentFilePath;
            } finally {
                await fs.promises.unlink(filename);
            }
        });

        it('should write data', async () => {
            const fo = await createFileFrom(baseFilename);
            let filename = fo.currentFilePath;
            try {
                {
                    const f = new FileMovie(filename);

                    await f.runAnalyse();

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

                    expect(f.currentFilePath).toMatch(new RegExp('^' + esc(tempPath('2020-01-02 02-03-04 new title ['))));
                }

                {
                    // Create a new file, and see if it is ok
                    const f = new FileMovie(filename);

                    await f.runAnalyse();
                    expect(f.get(FileTimestamped.I_ITS_TITLE).initial).toBe('new title');
                    expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe('2020-01-02 02-03-04');
                }
            } finally {
                await fs.promises.unlink(filename);
            }
        });
    });
}

describe(t(import.meta), function () {

    //   internal TS is '2019:09:19 07:48:25';
    testFullFlow('canon mov', 'DSC_2506.MOV', '2019-09-19 07-48-25', '');

    testFullFlow('android mp4', '2019-09-03 12-48/20190903_124726.mp4', '2019-09-03 12-47-31', '');
});