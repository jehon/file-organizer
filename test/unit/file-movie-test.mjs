
import fs from 'fs';
import FileMovie from '../../src/main/file-types/file-movie.js';
import FileTimed from '../../src/main/file-types/file-timed.js';
import { _resetCache } from '../../src/main/register-file-types.js';
import { createFileFrom, t, tempPath } from './help-functions.mjs';


/**
 * @param {string} title to describe the test
 * @param {string} baseFilename to be tested
 * @param {string} its_time - timestamp to be checked
 * @param {string} its_title - title to be checked
 */
function testFullFlow(title, baseFilename, its_time, its_title) {
    beforeEach(() => _resetCache());

    describe(`with ${title}`, function () {

        it('should read data', async () => {
            let filename = await createFileFrom(baseFilename);

            try {
                const f = new FileMovie(filename);
                await f.loadData();

                expect(f.get(FileTimed.I_FT_TIME).initial)
                    .withContext(baseFilename)
                    .toBe(its_time);
                expect(f.get(FileTimed.I_FT_TITLE).initial)
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

                    await f.loadData();
                    f.runPrepare();

                    /**
                     * @param {string} str to be escaped
                     * @returns {string} escaped
                     */
                    const esc = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string


                    // Set some values
                    f.get(FileTimed.I_FT_TITLE).expect('new title');
                    f.get(FileTimed.I_FT_TIME).expect('2020-01-02 02-03-04');

                    await f.runFix();
                    filename = f.currentFilePath;

                    expect(f.currentFilePath)
                        .withContext(baseFilename)
                        .toMatch(new RegExp('^' + esc(tempPath('2020-01-02 02-03-04 new title ['))));
                }

                {
                    // Create a new file, and see if it is ok
                    const f = new FileMovie(filename);

                    await f.loadData();
                    expect(f.get(FileTimed.I_FT_TITLE).initial)
                        .withContext(baseFilename)
                        .toBe('new title');
                    expect(f.get(FileTimed.I_FT_TIME).initial)
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
