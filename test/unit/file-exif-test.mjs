
import { tsFromString } from '../../src/main/timestamp.js';
import FileExif, { exif2ts, ts2exif } from '../../src/main/file-types/file-exif.js';
import FileTimestamped from '../../src/main/file-types/file-timestamped.js';
import File, { FOError } from '../../src/main/file-types/file.js';
import { t } from '../test-helper.js';
import { createFileFrom, dataPath } from './help-functions.mjs';

describe(t(import.meta), function () {
    describe('it should read data', function () {
        it('no exif', async function () {
            const f = new FileExif(dataPath('no_exif.jpg'));
            await f.runAnalyse();
            try {
                f.runConsistencyCheck();
            } catch (e) {
                if (!(e instanceof FOError)) {
                    throw e;
                }
            }

            expect(f.get(FileExif.I_FE_ORIENTATION).initial).toBe(0);
            expect(f.get(FileExif.I_FE_TZ).initial).toBe(null);
            expect(f.get(FileTimestamped.I_ITS_TITLE).initial).toBe('');
            expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe('');

            expect(f.get(FileExif.I_FE_ORIENTATION).expected).toBe(0);
        });

        it('time', async function () {
            const f = new FileExif(dataPath('1998-12-31 12-10-11 exifok01.jpg'));
            await f.runAnalyse();
            try {
                f.runConsistencyCheck();
            } catch (e) {
                if (!(e instanceof FOError)) {
                    throw e;
                }
            }

            expect(f.get(FileExif.I_FE_ORIENTATION).initial).toBe(0);
            expect(f.get(FileExif.I_FE_TZ).initial).toBe(null);
            expect(f.get(FileTimestamped.I_ITS_TITLE).initial).toBe('');
            expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe('1998-12-31 12-10-11');
        });

        it('title', async function () {
            const f = new FileExif(dataPath('20150306_153340 Cable internet dans la rue.jpg'));
            await f.runAnalyse();
            try {
                f.runConsistencyCheck();
            } catch (e) {
                if (!(e instanceof FOError)) {
                    throw e;
                }
            }

            expect(f.get(FileExif.I_FE_ORIENTATION).initial).toBe(90);
            expect(f.get(FileExif.I_FE_TZ).initial).toBe(null);
            expect(f.get(FileTimestamped.I_ITS_TITLE).initial).toBe('User comments');
            expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe('2015-03-06 15-33-40');

            expect(f.get(FileExif.I_FE_ORIENTATION).expected).toBe(0);
        });

        it('rotation', async function () {
            const f = new FileExif(dataPath('rotated-bottom-left.jpg'));
            await f.runAnalyse();
            try {
                f.runConsistencyCheck();
            } catch (e) {
                if (!(e instanceof FOError)) {
                    throw e;
                }
            }

            expect(f.get(FileExif.I_FE_ORIENTATION).initial).toBe(270);
            expect(f.get(FileExif.I_FE_TZ).initial).toBe(null);
            expect(f.get(FileTimestamped.I_ITS_TITLE).initial).toBe('rotated-bottom-left');
            expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe('2000');

            expect(f.get(FileExif.I_FE_ORIENTATION).expected).toBe(0);
        });
    });

    it('should generate exif timestamp', function () {
        // Date only cases
        expect(ts2exif(
            tsFromString('2018')
        )).toBe('2018:01:01 01:01:01');

        expect(ts2exif(
            tsFromString('2018-01')
        )).toBe('2018:01:02 02:02:02');

        expect(ts2exif(
            tsFromString('2018-02')
        )).toBe('2018:02:02 02:02:02');

        // exif is always in utc
        expect(ts2exif(
            exif2ts('2019:07:02 15:16:17', 'Europe/Brussels'),
            'Europe/Brussels'
        )).toBe('2019:07:02 15:16:17');

        expect(ts2exif(
            exif2ts('2019:07:02 15:16:17', 'Asia/Dhaka'),
            'Asia/Dhaka'
        )).toBe('2019:07:02 15:16:17');

        // Normal case
        expect(ts2exif(
            exif2ts('2019-01-02 03-04-05')
        )).toBe('2019:01:02 03:04:05');
    });

    describe('should write exif data', function () {
        it('should write', async () => {
            let filename = await createFileFrom('no_exif.jpg');

            {
                // Build up the data to be written
                const f = new FileExif(filename);
                await f.analyse();

                try {
                    f.runConsistencyCheck();
                } catch (e) {
                    if (!(e instanceof FOError)) {
                        throw e;
                    }
                }

                expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe('');
                f.get(FileTimestamped.I_ITS_TIME).expect(exif2ts('2020:01:02 03:05:06'));
                expect(f.get(FileTimestamped.I_ITS_TIME).expected.humanReadable()).toBe('2020-01-02 03-05-06');
                expect(f.get(File.I_FILENAME).expected).toBe('2020-01-02 03-05-06 no_exif');

                await f.act();
                filename = f.currentFilePath;
            }

            {
                // Check the data
                const f = new FileExif(filename);
                await f.analyse();
                expect(f.get(FileTimestamped.I_ITS_TIME).initial.humanReadable()).toBe('2020-01-02 03-05-06');
                expect(f.get(FileTimestamped.I_ITS_TITLE).initial).toBe('no_exif');
                filename = f.currentFilePath;
            }
        });
    });

});
