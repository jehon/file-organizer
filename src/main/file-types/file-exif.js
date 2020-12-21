
/**
 * Exif File
 *
 * See https://www.sno.phy.queensu.ca/~phil/exiftool/#supported
 *
 * QuickTime -> mov?
 *
 * According to the specification, many QuickTime date/time tags should be stored as UTC.
 * Unfortunately, digital cameras often store local time values instead (presumably because
 * they don't know the time zone). For this reason, by default ExifTool does not assume
 * a time zone for these values. However, if the QuickTimeUTC API option is set, then ExifTool
 * will assume these values are properly stored as UTC, and will convert them to local time when extracting.
 *
 */

/**
 * Exif executable
 */
const EXIFTOOL = 'exiftool';

import FileTimestamped from './file-timestamped.js';
import timestampFactory from '../../../file-organizer/timestamp.js';
const { tsFromExif, tzFromGPS, tsFromString } = timestampFactory;
import fileUtils from '../../../file-organizer/file-utils.js';

import debug from 'debug';
const debugExif = debug('exiftool');
const debugExifOutput = debugExif.extend('output');

import PQueue from 'p-queue'; // https://www.npmjs.com/package/p-queue
const exifExecLimiter = new PQueue.default({ concurrency: 5 });

import commandExists from 'command-exists';
import Value from '../value.js';
const commandExistsSync = commandExists.sync;
// returns true/false; doesn't throw
if (!commandExistsSync(EXIFTOOL)) {
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
        fileUtils.fileExec(EXIFTOOL, [...params])
            .then(log => { debugExif('runExif result: ', log); return log; })
            .catch(processResult => {
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
            })
            .then(log => log ? log : ''),
        { priority });
}

/**
 * @param {FileExif} file to be analysed
 * @param {string} tag name
 * @param {string} value to be written
 */
export async function exifWrite(file, tag, value) {
    debugExif('exifWrite:', file.currentPath, tag, value);
    await runExif(10,
        [
            '-overwrite_original',
            '-m', // Ignore minor errors and warnings
            `-${tag}=${value}`, file.currentPath
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
    debugExif('exifReadAll:', file.currentPath);

    const txtResult = await runExif(0,
        [
            '-j',
            '-m', // Ignore minor errors and warnings
            file.currentPath
        ]);

    let rawExifData = JSON.parse(txtResult)[0];
    debugExif('exifReadAll got:', file.currentPath, rawExifData);

    const exifData = {
        title: rawExifData[file.EXIF_TITLE] || '',
        ts: tsFromString(''),
        timezone: null,
        orientation: translateRotation(rawExifData.Orientation)
    };

    // TODO(timezone): decide how the time is stored in the application
    //    and unify it
    if (rawExifData.GPSPosition) {
        exifData.timezone = tzFromGPS(rawExifData.GPSPosition);
    }

    // If the data is stored in UTC and if we have a timezone,
    // translate the date/time into local time (of the timezone)
    exifData.ts = tsFromExif(rawExifData[file.EXIF_TS], (
        file.EXIF_TS_IS_UTC && exifData.timezone ? exifData.timezone : false)
    );

    return exifData;
}

export default class FileExif extends FileTimestamped {
    static I_FE_ORIENTATION = 'FileExif_orientation'
    static I_FE_TZ = 'FileExif_tz'

    get EXIF_TS() { return 'DateTimeOriginal'; }
    get EXIF_TITLE() { return 'UserComment'; }
    get EXIF_TS_IS_UTC() { return false; }

    async readInternalData() {
        await super.readInternalData();

        const data = await exifReadAll(this);

        this.set(FileExif.I_FE_TZ, new Value(data.timezone));
        this.set(FileExif.I_FE_ORIENTATION, new Value(data.orientation));

        // TODO(timezone): link data's TZ ???

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

        // TODO(timezone): handle timezone?
    }

    async act() {
        const title = this.get(FileTimestamped.I_ITS_TITLE);

        if (!title.isDone()) {
            await exifWrite(this, this.EXIF_TITLE, title.expected);
            title.fix();
        }

        const ts = this.get(FileTimestamped.I_ITS_TIME);
        if (!ts.isDone()) {

            let tsFormatted = '0000:00:00 00:00:00';

            if (ts.expected.isTimestamped()) {
                let tsZoned = ts.expected.moment;

                // TODO: refactor about date's and timestamps

                // If a timezone is set, and the exif timestamp is not stored in UTC
                // then we need to calculate the moment in local timezone
                if (this.EXIF_TS_IS_UTC && this.get(FileExif.I_FE_TZ).expected) {

                    // We adapt the tz field, but not the time
                    // @See https://momentjs.com/timezone/docs/#/using-timezones/converting-to-zone/
                    tsZoned = tsZoned.tz(this.get(FileExif.I_FE_TZ).expected, true);
                }

                const utc = tsZoned.clone().utc();
                tsFormatted = utc.format('YYYY:MM:DD HH:mm:ss');
            }

            await exifWrite(this, this.EXIF_TS, tsFormatted);
            ts.fix();
        }

        await super.act();
    }
}
