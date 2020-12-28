
import { t } from './help-functions.mjs';
import fs from 'fs';
import path from 'path';

import File, { FOError } from '../../src/main/file-types/file.js';
import FileTimestamped from '../../src/main/file-types/file-timestamped.js';

import options, { _resetToDefault } from '../../src/common/options.js';

import {
    tempPath
} from './help-functions.mjs';
import { exif2ts } from '../../src/main/file-types/file-exif.js';

/**
 * @param {File} file whose parents need to be created
 */
function mkParentFolder(file) {
    fs.mkdirSync(path.dirname(file.currentFilePath), { recursive: true });
}

describe(t(import.meta), function () {
    describe('it should complete', function () {
        it('should take the new title from filename', async () => {
            const f = new FileTimestamped('2020-01-01 canon.JPG');
            f.readInternalData = () => ({
                ts: exif2ts('1999:01:02 03:04:05'),
                title: ''
            });

            await f.loadData();
            f.prepare();

            expect(f.get(File.I_FN_TITLE).expected).toBe('canon');
            expect(f.get(FileTimestamped.I_ITS_TITLE).expected).toBe('canon');
        });

        it('should take the new title from the folder when nothing is found', async () => {
            const f = new FileTimestamped('1998 parent title/1998-12-31 12-10-11.jpg');
            expect(f.parent.get(File.I_FN_TITLE).initial).toBe('parent title');
            f.readInternalData = () => ({
                ts: exif2ts('1999:01:02 03:04:05'),
                title: ''
            });

            await f.loadData();
            f.prepare();

            expect(f.getCanonicalFilename()).toBe('1999-01-02 03-04-05 parent title');
        });
    });

    describe('should adapt to options', () => {
        afterEach(() => {
            _resetToDefault();
        });

        it('should take the title from options', async () => {
            options.setTitle = 'blablabla';

            const f = new FileTimestamped('2020-01-01 canon.JPG');
            f.readInternalData = () => ({
                ts: exif2ts('1999:01:02 03:04:05'),
                title: 'exif_title'
            });

            await f.loadData();
            f.prepare();
            expect(f.get(File.I_FN_TITLE).expected).toBe('blablabla');
            expect(f.get(FileTimestamped.I_ITS_TITLE).expected).toBe('blablabla');
        });

        it('should take the new title from the folder when option require it', async () => {
            options.forceTitleFromFolder = true;

            const f = new FileTimestamped('1998 parent title/1998-12-31 12-10-11 blabla.jpg');

            expect(f.parent.get(File.I_FN_TITLE).initial).toBe('parent title');
            f.readInternalData = () => ({
                ts: exif2ts('1999:01:02 03:04:05'),
                title: 'exif_title'
            });

            await f.loadData();
            f.prepare();

            expect(f.get(File.I_FN_TITLE).expected).toBe('parent title');
            expect(f.get(FileTimestamped.I_ITS_TITLE).expected).toBe('parent title');
            expect(f.getCanonicalFilename()).toBe('1999-01-02 03-04-05 parent title');
        });

        it('should take the new title from the filename when option require it', async () => {
            options.forceTitleFromFilename = true;

            const f = new FileTimestamped('1998-12-31 12-10-11 blabla.jpg');
            f.readInternalData = () => ({
                ts: exif2ts('1999:01:02 03:04:05'),
                title: 'exif_title'
            });

            await f.loadData();
            f.prepare();

            expect(f.get(File.I_FN_TITLE).expected).toBe('blabla');
            expect(f.get(FileTimestamped.I_ITS_TITLE).expected).toBe('blabla');
            expect(f.getCanonicalFilename()).toBe('1999-01-02 03-04-05 blabla');
        });

        it('should take the new timestamp from the filename when option require it', async () => {
            options.forceTimestampFromFilename = true;

            const f = new FileTimestamped('1998-12-31 12-10-11 blabla.jpg');
            f.readInternalData = () => ({
                ts: exif2ts('1999:01:02 03:04:05'),
                title: 'exif_title'
            });

            await f.loadData();
            f.prepare();

            expect(f.get(File.I_FN_TIME).expected.humanReadable()).toBe('1998-12-31 12-10-11');
            expect(f.get(FileTimestamped.I_ITS_TIME).expected.humanReadable()).toBe('1998-12-31 12-10-11');
            expect(f.getCanonicalFilename()).toBe('1998-12-31 12-10-11 exif_title');
        });

    });

    describe('should check coherence with parent folder', () => {
        it('should be ok when file date and folder date are coherent', async () => {
            const f = new FileTimestamped(tempPath('1998-12-31 virtual', '1998-12-31 12-13-24 test.jpg'));
            mkParentFolder(f);
            await f.parent.loadData();
            await f.loadData();

            expect(f.hasProblem(FileTimestamped.P_TS_INCOHERENT)).toBeFalse();
        });

        it('should be ok when file date and folder range date are coherent', async () => {
            const f = new FileTimestamped(tempPath('1996-2000 virtual', '1998-12-31 12-13-24 test.jpg'));
            mkParentFolder(f);
            await f.parent.loadData();
            await f.loadData();
            expect(f.hasProblem(FileTimestamped.P_TS_INCOHERENT)).toBeFalse();
        });

        it('should report when file and folder date incoherent', async () => {
            const f = new FileTimestamped(tempPath('1998-12-31 virtual', '1999-09-09 12-00-00 test.jpg'));
            mkParentFolder(f);
            await f.parent.loadData();
            await f.loadData();
            expect(() => f.runPrepare()).toThrowError(FOError);
            expect(f.hasProblem(FileTimestamped.P_TS_INCOHERENT)).toBeTrue();
        });
    });
});
