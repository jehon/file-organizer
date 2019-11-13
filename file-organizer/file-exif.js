
/**
 * Exif File
 *
 * See https://www.sno.phy.queensu.ca/~phil/exiftool/#supported
 *
 *
 * According to the specification, many QuickTime date/time tags should be stored as UTC.
 * Unfortunately, digital cameras often store local time values instead (presumably because
 * they don't know the time zone). For this reason, by default ExifTool does not assume
 * a time zone for these values. However, if the QuickTimeUTC API option is set, then ExifTool
 * will assume these values are properly stored as UTC, and will convert them to local time when extracting.
 *
 */

const FileTimestamped = require('./file-timestamped.js');
const { tsFromExif, tzFromGPS } = require('./timestamp.js');
const options = require('./options.js');
const fileUtils = require('./file-utils.js');

const debugExif = require('debug')('exiftool');
const debugExifOutput = debugExif.extend('output');

const { default: PQueue } = require('p-queue'); // https://www.npmjs.com/package/p-queue
const exifExecLimiter = new PQueue({ concurrency: 5 });

var commandExistsSync = require('command-exists').sync;
// returns true/false; doesn't throw
if (!commandExistsSync('exiftool')) {
	console.error('Command exiftool not found in path');
	process.exit(1);
}

// @Limited(x)
async function runExif(priority, params) {
	return exifExecLimiter.add(() =>
		fileUtils.fileExec('exiftool', [ ...params])
			.then(log => { debugExif('runExif result: ', log); return log; })
			.catch(processResult => {
				console.error(processResult);
				debugExif('runExif result:', processResult.code);
				debugExifOutput('runExif output:', processResult.stdout, processResult.stderr);
				switch(processResult.code) {
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
*** exiftool '${params.join(' , ')}'
*** ${processResult.stderr.toString()}
*********
`);
					throw new Error('runExif failed');
				}

				throw processResult;
			})
			.then(log => log ? log :''),
	{ priority });
}

async function exifWrite(file, tag, value) {
	debugExif('exifWrite:', file.getPath(), tag, value);
	return runExif(10,
		[
			'-overwrite_original',
			'-m', // Ignore minor errors and warnings
			`-${tag}=${value}`, file.getPath()
		]
	);
}

function translateRotation(rotation) {
	switch(rotation) {
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

	case 'Horizontal (normal)':
	case 'Unknown (0)':
	case 'top, left':
	case '':
	case '(0)':
		// No information given
		return 0;

	default:
		throw new Error(`exifReadRotation: could not understand value: ${rotation}`);
	}

}

module.exports = class FileExif extends FileTimestamped {
	get constExifTS() { return 'DateTimeOriginal'; }
	get constExifTitle() { return 'UserComment'; }

	async loadData() {
		await super.loadData();

		// This take time during construction
		await this.exifReload();

		this.setCalculatedTS(this.exif_timestamp);
		if (options.forceTimestampFromFilename) {
			this.calculatedTS = this.filenameTS.clone();
		}

		if (this.exif_title) {
			this.calculatedTS.comment = this.exif_title
			// 	.replace(/( |-|[0-9]{2,10})+$/, '')
			;
		}

		return this;
	}

	async exifReadAll() {
		debugExif('exifReadAll:', this.getPath());
		const defaultResult = {
			'Orientation': '',
			'GPSPosition': '',
			'calculatedTimezone': ''
		};
		defaultResult[this.constExifTS] = '';
		defaultResult[this.constExifTitle] = '';

		return runExif(0,
			[
				'-j',
				'-m', // Ignore minor errors and warnings
				this.getPath()
			])
			.then(result => {
				let exifData = JSON.parse(result)[0];
				debugExif('exifReadAll got:', this.getPath(), exifData[this.constExifTS]);
				if (exifData.GPSPosition) {
					exifData.calculatedTimezone = tzFromGPS(exifData.GPSPosition);
				}
				return Object.assign({}, defaultResult, exifData);
			});
	}

	async exifReload() {
		return this.exifReadAll().then(exifData => {
			this.exif_timestamp_raw       = exifData[this.constExifTS];
			this.exif_timestamp           = tsFromExif(exifData[this.constExifTS], this.exif_calculated_timezone);
			this.exif_title             = exifData[this.constExifTitle];
			this.exif_orientation         = translateRotation(exifData['Orientation']);
			return exifData;
		});
	}

	async exifWriteTimestamp(ts_original) {
		const ts = ts_original.clone();
		return exifWrite(this, this.constExifTS, ts.exif())
			.then(() => {
				this.exif_timestamp_raw = ts.exif();
				this.exif_timestamp     = tsFromExif(this.exif_timestamp_raw, this.exif_calculated_timezone);
				this.setCalculatedTS(ts);
				return this;
			});
	}

	async exifWriteTitle(msg) {
		return exifWrite(this, this.constExifTitle, msg)
			.then(() => {
				this.exif_title = msg;
				this.calculatedTS.comment = msg;
				return this;
			});
	}

	async check() {
		let res = true;
		if (!await super.check()) {
			return false;
		}

		if (this.exif_title != this.calculatedTS.comment && this.calculatedTS.comment) {
			const c = this.calculatedTS.comment;
			res = res && await this.addMessageCommit('EXIF_WRITE_COMMENT', 'Write comment',
				c,
				() => this.exifWriteTitle(c)
			);
		}

		if (this.exif_timestamp_raw != this.calculatedTS.exif() && this.calculatedTS.humanReadable()) {
			res = res && await this.addMessageCommit('EXIF_WRITE_TIMESTAMP', 'Write timestamp',
				`${this.calculatedTS.humanReadable()} (${this.calculatedTS.exif()}) <- ${this.exif_timestamp_raw}`,
				() => this.exifWriteTimestamp(this.calculatedTS)
			);
		}
		return res;
	}
};
