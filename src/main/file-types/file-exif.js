
//
// Exif File
//
//  See https://www.sno.phy.queensu.ca/~phil/exiftool/#supported
//  QuickTime -> mov?
//
// According to the specification, many QuickTime date/time tags should be stored as UTC.
// Unfortunately, digital cameras often store local time values instead (presumably because
// they don't know the time zone). For this reason, by default ExifTool does not assume
// a time zone for these values. However, if the QuickTimeUTC API option is set, then ExifTool
// will assume these values are properly stored as UTC, and will convert them to local time when extracting.
//
//

//
// The timestamp string must be stored in the application in the local time of the element
//    It will be translated from/to UTC onRead and onWrite when necessary
//
// TODO (urgent): timestamp in string
//


/**
 * Exif executable
 */
const EXIFTOOL = 'exiftool';

import FileTimestamped from './file-timestamped.js';
import Timestamp, { parseFilename } from '../timestamp.js';

import debug from 'debug';
const debugExif = debug('exiftool');
const debugExifOutput = debugExif.extend('output');

import PQueue from 'p-queue'; // https://www.npmjs.com/package/p-queue
const exifExecLimiter = new PQueue.default({ concurrency: 5 });

import { execFile } from 'child_process';
import { promisify } from 'util';
const pExecFile = promisify(execFile);

import commandExists from 'command-exists';
import Value from '../value.js';
import { coordonate2tz } from '../time-helpers.js';

// returns true/false; doesn't throw
if (!commandExists.sync(EXIFTOOL)) {
    console.error('Command exiftool not found in path');
    // TODO: this is not easy to debug:
    process.exit(254);
}

/**
 * Limited //isme on exifExecLimiter
 *
 * @param {number} priority to which it is run in the queue
 * @param {Array<string>} params to be passed to EXIFTOOL
 * @returns {Promise<string>} the result of the command
 */
export async function runExif(priority, params) {
    return exifExecLimiter.add(() =>
        pExecFile(EXIFTOOL, [...params])
            .then(
                result => { debugExif('runExif result: ', result); return result.stdout; },
                processResult => {
                    console.error(processResult);
                    debugExif('runExif result:', processResult.code);
                    debugExifOutput('runExif output:', processResult.stdout, processResult.stderr);
                    switch (processResult.code) {
                        case 0:   // ok, continue
                            break;
                        // case 1:   // The file contains data of an unknown image type
                        case 253: // No exif data found in file
                            return '';
                        case 255: // File does not exists
                            return '';
                        default:
                            console.error(`
*********
*** runExif process: ${processResult.code}
*** ${EXIFTOOL} '${params.join(' , ')}'
*** ${processResult.stderr.toString()}
*********
`);
                            throw new Error('runExif failed');
                    }

                    throw processResult;
                }
            )
            .then(stdout => stdout ? stdout : ''),
        { priority });
}

/**
 * @param {FileExif} file to be analysed
 * @param {string} tag name
 * @param {string} value to be written
 */
export async function exifWrite(file, tag, value) {
    debugExif('exifWrite:', file.currentFilePath, tag, value);
    await runExif(10,
        [
            '-overwrite_original',
            '-m', // Ignore minor errors and warnings
            `-${tag}=${value}`, file.currentFilePath
        ]
    );
}

/**
 * @param {string} rotation received from exif
 * @returns {number} in an human readable form
 */
function translateRotation(rotation) {
    switch (rotation) {
        // What is the top-left corner?
        case 'Rotate 270 CW':
        case 'left, bottom':
            // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_8.jpg
            return 270;

        case 'Rotate 90 CW':
        case 'right, top':
            // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_6.jpg
            return 90;

        case 'bottom, right':
            // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_3.jpg
            return 180;

        // No information given
        case undefined:
        case 'Unknown (0)':
        case '':
        case '(0)':
        case 'top, left':
        case 'Horizontal (normal)':
            return 0;

        default:
            throw new Error(`exifReadRotation: could not understand value: ${rotation}`);
    }
}

/**
 * Read all required data from exif
 * And returns them as object
 *
 * @param {FileExif} file to be analysed
 * @returns {Promise<object>} with exif data
 * @property {string} title of the element
 * @property {string} orientation of the element
 * @property {string} timezone of the element
 * @property {module:file-organizer/Timestamp} ts of the element
 */
async function exifReadAll(file) {
    debugExif('exifReadAll:', file.currentFilePath);

    const txtResult = await runExif(0,
        [
            '-j',
            '-m', // Ignore minor errors and warnings
            file.currentFilePath
        ]);

    let rawExifData = JSON.parse(txtResult)[0];
    debugExif('exifReadAll got:', file.currentFilePath, rawExifData);

    const exifData = {
        title: rawExifData[file.EXIF_TITLE] || '',
        ts: parseFilename('').ts,
        timezone: null,
        orientation: translateRotation(rawExifData.Orientation)
    };

    if (rawExifData.GPSPosition) {
        exifData.timezone = coordonate2tz(rawExifData.GPSPosition);
    }

    // If the data is stored in UTC and if we have a timezone,
    // translate the date/time into local time (of the timezone)
    exifData.ts = exif2ts(rawExifData[file.EXIF_TS], (
        file.EXIF_TS_STORED_IN_UTC && exifData.timezone ? exifData.timezone : false)
    );

    return exifData;
}

const EMPTY_EXIF = '0000:00:00 00:00:00';
// const TS_REGEXP = /(?<year>[0-9][0-9][0-9][0-9])([-:](?<month>[0-1][0-9])([-:](?<day>[0-3][0-9]))?)?( (?<hour>[0-2][0-9])[:-](?<minute>[0-5][0-9])([:-](?<second>[0-5][0-9])(?<timezone>[+-]\d\d:\d\d)?))?/;

/**
 * Return the timestamp in local timezone
 *
 * TODO: use strings !
 *
 * @param {string} exif - the exif just read from the file
 * @param {string} tz - the timezone
 * @returns {module:src/main/Timestamp} parsed and in local timezone
 */
export function exif2ts(exif, tz) {
    if (exif == EMPTY_EXIF) {
        return new Timestamp();
    }
    // return parseFilename(exif.split(':').join('-'));
    // TODO: handle timezone here and return new Timestamp(exif)
    return new Timestamp(exif, tz);
}

/**
 * TODO: use strings !
 *
 * @param {module:/src/main/Timestamp} ts - timestamp to be transformed
 * @param {boolean} isUTC - true if the data must be stored in UTC
 * @param {string} tz - the timezone
 * @returns {string} the timezone transformed
 */
export function ts2exif(ts, isUTC, tz) {
    if (!ts.isTimestamped()) {
        return EMPTY_EXIF;
    }

    let tsZoned = ts.moment;

    // If a timezone is set, and the exif timestamp is not stored in UTC
    // then we need to calculate the moment in local timezone
    if (isUTC && tz) {

        // We adapt the tz field, but not the time
        // @See https://momentjs.com/timezone/docs/#/using-timezones/converting-to-zone/
        tsZoned = tsZoned.tz(tz, true);
    }

    const utc = tsZoned.clone().utc();
    return utc.format('YYYY:MM:DD HH:mm:ss');
}

export default class FileExif extends FileTimestamped {
    static I_FE_ORIENTATION = 'FileExif_orientation'
    static I_FE_TZ = 'FileExif_tz'

    get EXIF_TS() { return 'DateTimeOriginal'; }
    get EXIF_TITLE() { return 'UserComment'; }
    get EXIF_TS_STORED_IN_UTC() { return false; }

    async readInternalData() {
        await super.readInternalData();

        const data = await exifReadAll(this);

        this.set(FileExif.I_FE_TZ, new Value(data.timezone));
        this.set(FileExif.I_FE_ORIENTATION, new Value(data.orientation));

        return {
            ts: data.ts,
            title: data.title
        };
    }

    /**
     * @override
     */
    async analyse() {
        await super.analyse();

        this.get(FileExif.I_FE_ORIENTATION).expect(0, 'orientation to top');

        // TODO(timezone): force BRU timezone?
    }

    async act() {
        const title = this.get(FileTimestamped.I_ITS_TITLE);

        if (!title.isDone()) {
            await exifWrite(this, this.EXIF_TITLE, title.expected);
            title.fix();
        }

        const ts = this.get(FileTimestamped.I_ITS_TIME);
        if (!ts.isDone()) {
            await exifWrite(this, this.EXIF_TS,
                // TODO: humanreadable()
                ts2exif(ts.expected, this.EXIF_TS_STORED_IN_UTC, this.get(FileExif.I_FE_TZ).expected)
            );
            ts.fix();
        }

        await super.act();
    }
}
