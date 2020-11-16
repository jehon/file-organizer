
import { t } from '../test-helper.js';

import { dataPath, createFileGeneric } from './help-functions.mjs';
import FileMovie from '../../file-organizer/file-movie.js';
import { tsFromString } from '../../file-organizer/timestamp.js';
import { buildFile } from '../../src/main/register-file-types.js';

/**
 * @param dPath
 */
async function getMov(dPath) {
    return new FileMovie(dataPath(dPath)).loadData();
}

const canonMOV = 'DSC_2506.MOV';
const canonMOV_EXIF_TS = '2019:09:19 07:48:25';

const AndroidMP4 = '2019-09-03 12-48/20190903_124726.mp4';
const AndroidMP4_TS = '2019-09-03 12-47-31';
const AndroidMP4_EXIF_TS = '2019:09:03 10:47:31';

describe(t(import.meta), function () {
    it('should get exif from files', async () => {
        // Canon files
        let mov;
        mov = await getMov(canonMOV);
        expect(mov.exif_timestamp_raw).toBe(canonMOV_EXIF_TS);

        // Adroid files
        mov = await getMov(AndroidMP4);
        expect(mov.exif_timestamp_raw).toBe(AndroidMP4_EXIF_TS);
        expect(mov.exif_calculated_timezone).toBe('Europe/Brussels');
        expect(mov.exif_timestamp.humanReadable()).toBe(AndroidMP4_TS);
    });

    it('should get title from files', async () => {
        // Android files
        expect((await getMov(canonMOV)).exif_title).toBe('');
        expect((await getMov(AndroidMP4)).exif_title).toBe('');
    });

    it('should write timestamps correctly with MOV', async () => {
        const new1 = await createFileGeneric(canonMOV);
        expect(new1.exif_calculated_timezone).toBe('');
        expect(new1.exif_timestamp.exif()).toBe(canonMOV_EXIF_TS);

        // We don't have a timezone, so everything is "utc"
        await new1.exifWriteTimestamp(tsFromString('2016-02-04 01-02-03'));
        expect(new1.exif_calculated_timezone).toBe('');
        expect(new1.exif_timestamp.exif()).toBe('2016:02:04 01:02:03');
        expect(new1.exif_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

        const new2 = await buildFile(new1.getPath());
        await new2.loadData();
        expect(new2.exif_calculated_timezone).toBe('');
        expect(new2.exif_timestamp.exif()).toBe('2016:02:04 01:02:03');
        expect(new2.exif_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

        new1.remove();
    });

    it('should write timestamps correctly with MP4', async () => {
        const new1 = await createFileGeneric(AndroidMP4);
        expect(new1.exif_calculated_timezone).toBe('Europe/Brussels');
        expect(new1.exif_timestamp.exif()).toBe(AndroidMP4_EXIF_TS);

        await new1.exifWriteTimestamp(tsFromString('2016-02-04 01-02-03'));
        expect(new1.exif_calculated_timezone).toBe('Europe/Brussels');
        expect(new1.exif_timestamp.exif()).toBe('2016:02:04 00:02:03');
        expect(new1.exif_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

        const new2 = await buildFile(new1.getPath());
        await new2.loadData();
        expect(new2.exif_calculated_timezone).toBe('Europe/Brussels');
        expect(new2.exif_timestamp_raw).toBe('2016:02:04 00:02:03');
        expect(new2.exif_timestamp.exif()).toBe('2016:02:04 00:02:03');
        expect(new2.exif_timestamp.humanReadable()).toBe('2016-02-04 01-02-03');

        new1.remove();
    });

    it('should write titles correctly', async () => {
        const newTitle = 'test';
        const new1 = await createFileGeneric(canonMOV);
        expect(new1.exif_title).toBe('');

        await new1.exifWriteTitle(newTitle);
        expect(new1.exif_title).toBe(newTitle);

        const new2 = await buildFile(new1.getPath());
        await new2.loadData();
        expect(new2.exif_title).toBe(newTitle);

        new1.remove();
    });

});
