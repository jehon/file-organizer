
import { t } from '../test-helper.js';

import FileExif from '../../src/main/file-types/file-exif.js';
import { dataPath } from './help-functions.mjs';
import FileTimestamped from '../../src/main/file-types/file-timestamped.js';
import { FOError } from '../../src/main/file-types/file.js';

describe(t(import.meta), function () {
    describe('it should read data', function () {
        it('no exif', async function () {
            const f = new FileExif(dataPath('no_exif.jpg'));
            try {
                await f.runAnalyse();
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
            try {
                await f.runAnalyse();
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
            try {
                await f.runAnalyse();

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
            try {
                await f.runAnalyse();

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

    xdescribe('should write exif data', function () {

    });

});
