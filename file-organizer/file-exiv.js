
const FileTimestamped = require('./file-timestamped.js');
const { tsFromString } = require('./timestamp.js');
const options = require('./options.js');
const fileUtils = require('./file-utils.js');

const debugExiv = require('debug')('exivtool');
const debugExivOutput = debugExiv.extend('output');

const pLimit = require('p-limit'); // https://www.npmjs.com/package/p-limit
const exivExecLimiter = pLimit(5);

var commandExistsSync = require('command-exists').sync;
// returns true/false; doesn't throw
if (!commandExistsSync('exiftool')) {
	console.error('Command exiftool not found in path');
	process.exit(1);
}

// @Limited(x)
async function runExiv(...params) {
	return exivExecLimiter(() =>
		fileUtils.fileExec('exiftool', [ ...params])
			.then(log => { debugExiv('runExiv result: ', log); return log; })
			.catch(processResult => {
				console.error(processResult);
				debugExiv('runExiv result:', processResult.code);
				debugExivOutput('runExiv output:', processResult.stdout, processResult.stderr);
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
*** runExiv process: ${processResult.code}
*** exiftool '${params.join(' , ')}'
*** ${processResult.stderr.toString()}
*********
`);
					throw new Error('runExiv failed');
				}

				throw processResult;
			})
			.then(log => log ? log :'')
	);
}

async function exivWrite(file, tag, value) {
	debugExiv('exivWrite:', file.getRelativePath(), tag, value);
	return runExiv(
		'-overwrite_original',
		'-m', // Ignore minor errors and warnings
		`-${tag}=${value}`, file.getRelativePath()
	);
}

async function exivReadAll(file) {
	debugExiv('exivReadAll:', file.getRelativePath());
	const defaultResult = {
		'UserComment': '',
		'DateTimeOriginal': '',
		'Orientation': '',
		'calculatedTimezone': null
	};
	return runExiv('-j',
		'-m', // Ignore minor errors and warnings
		file.getRelativePath())
		.then(result => {
			let resultObj = JSON.parse(result)[0];
			debugExiv('exivReadAll got:', file.getRelativePath(), resultObj['DateTimeOriginal']);
			return Object.assign({}, defaultResult, resultObj);
		});
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
		throw new Error(`exivReadRotation: could not understand value: ${rotation}`);
	}

}

module.exports = class FileExiv extends FileTimestamped {
	async loadData() {
		await super.loadData();

		// This take time during construction
		await this.exivReload();

		this.setCalculatedTS(this.exiv_timestamp);
		if (this.exiv_comment) {
			this.calculatedTS.comment = this.exiv_comment
			// 	.replace(/( |-|[0-9]{2,10})+$/, '')
			;
		}

		if (options.forceTimestampFromFilename) {
			this.calculatedTS = this.filenameTS.clone();
		}

		return this;
	}

	async exivReadAll() {
		return exivReadAll(this);
	}

	async exivReload(){
		return this.exivReadAll().then(exivData => {
			this.exiv_timestamp_raw    = exivData['DateTimeOriginal'];
			this.exiv_timestamp        = tsFromString(exivData['DateTimeOriginal']);
			this.exiv_comment          = exivData['UserComment'];
			this.exiv_orientation      = translateRotation(exivData['Orientation']);
			this.exiv_calculated_tz    = exivData['calculatedTimezone'];

			return this;
		});
	}

	async exivWriteTimestamp(ts) {
		const empty = '0000-00-01 00-00-00';
		if (ts.length < empty.length) {
			ts = ts + empty.substr(ts.length);
			this.addMessageInfo('EXIV_UPGRADE_TIMESTAMP', 'Update timestamp to ' + ts);
		}

		return exivWrite(this, 'DateTimeOriginal', ts.split('-').join(':'))
			.then(() => {
				this.exiv_timestamp = tsFromString(ts);
				this.setCalculatedTS(tsFromString(ts));
				return this;
			});
	}

	async exivWriteComment(msg) {
		return exivWrite(this, 'UserComment', msg)
			.then(() => {
				this.exiv_comment = msg;
				this.calculatedTS.comment = msg;
				return this;
			});
	}

	async check() {
		let res = true;
		if (!await super.check()) {
			return false;
		}

		if (this.exiv_comment != this.calculatedTS.comment && this.calculatedTS.comment) {
			const c = this.calculatedTS.comment;
			res = res && await this.addMessageCommit('EXIV_WRITE_COMMENT', 'Write comment',
				c,
				() => this.exivWriteComment(c)
			);
		}

		if (this.exiv_timestamp.TS() != this.calculatedTS.TS() && this.calculatedTS.TS()) {
			res = res && await this.addMessageCommit('EXIV_WRITE_TIMESTAMP', 'Write timestamp',
				this.calculatedTS.TS(),
				() => this.exivWriteTimestamp(this.calculatedTS.TS())
			);
		}
		return res;
	}
};
