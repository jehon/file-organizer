
var spawnSync = require('child_process').spawnSync;

const messages = require('./messages.js');
const FileTimestamped = require('./file-timestamped.js');
const { tsFromString } = require('./timestamp.js');
const BusinessError = require('./business-error.js');


var commandExistsSync = require('command-exists').sync;
// returns true/false; doesn't throw
if (!commandExistsSync('exiftool')) {
	console.error('Command exiftool not found in path');
	process.exit(0);
}

// const technicalTags = new Map();
// technicalTags.set('UserComment',      'Exif.Photo.UserComment');
// technicalTags.set('DateTimeOriginal', 'Exif.Photo.DateTimeOriginal');
// technicalTags.set('Orientation',      'Exif.Image.Orientation');

// function getByValue(map, searchValue) {
// 	for (let [key, value] of map.entries()) {
// 		if (value === searchValue)
// 			return key;
// 	}
// 	return searchValue;
// }

function runExiv(...params) {
	//
	// Error here ? check exiv is installed :-)
	//
	let processResult = spawnSync('exiftool', [ '-j', ...params]);
	switch(processResult.status) {
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
*** runExiv process: ${processResult.status}
*** exiftool '${params.join(' , ')}'
*** ${processResult.stderr.toString()}
*********
`);
		throw new BusinessError('runExiv failed');
	}
	if (processResult.stdout != null) {
		return processResult.stdout.toString();
	}
	return '';
}

function exivWrite(file, tag, value) {
	return runExiv(
		'-overwrite_original',
		`-${tag}=${value}`, file.getRelativePath()
	);
}

function exivReadAll(file) {
	const defaultResult = {
		'UserComment': '',
		'DateTimeOriginal': '',
		'Orientation': ''
	};
	const result = runExiv(file.getRelativePath());
	let resultObj = JSON.parse(result)[0];
	return Object.assign({}, defaultResult, resultObj);
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
		throw new BusinessError(`exivReadRotation: could not understand value: ${rotation}`);
	}

}

module.exports = class FileExiv extends FileTimestamped {
	async loadData() {
		await super.loadData();

		// This take time during construction
		this.exivReload();

		this.setCalculatedTS(this.exiv_timestamp);
		if (this.exiv_comment) {
			this.calculatedTS.comment = this.exiv_comment
				.replace(/( |-|[0-9]{2,10})+$/, '')
			;
		}

		return this;
	}

	exivReadAll() {
		return exivReadAll(this);
	}

	exivReload(){
		const exivData = this.exivReadAll();

		this.exiv_timestamp_raw    = exivData['DateTimeOriginal'];
		this.exiv_timestamp        = tsFromString(exivData['DateTimeOriginal']);
		this.exiv_comment          = exivData['UserComment'];
		this.exiv_orientation      = translateRotation(exivData['Orientation']);

		this.addInfo('exiv.timestamp_raw', this.exiv_timestamp_raw);
		this.addInfo('exiv.timestamp',     this.exiv_timestamp.TS());
		this.addInfo('exiv.comment',       this.exiv_comment);
		this.addInfo('exiv.orientation',   this.exiv_orientation);
	}

	exivWriteTimestamp(ts) {
		const empty = '0000-00-01 00-00-00';
		if (ts.length < empty.length) {
			ts = ts + empty.substr(ts.length);
			messages.fileInfo(this, 'EXIV_UPGRADE_TIMESTAMP', 'Update timestamp to ' + ts);
		}

		exivWrite(this, 'DateTimeOriginal', ts.split('-').join(':'));
		this.exiv_timestamp = tsFromString(ts);
		this.setCalculatedTS(tsFromString(ts));
	}

	exivWriteComment(msg) {
		exivWrite(this, 'UserComment', msg);
		this.exiv_comment = msg;
		this.calculatedTS.comment = msg;
	}

	async check() {
		let res = true;
		if (!this.exiv_timestamp.TS()) {
			res = res && messages.fileImpossible(this, 'EXIV_NO_DATE', 'Exiv: no date found');
		}

		if (!res) {
			return res;
		}

		if (!await super.check()) {
			return false;
		}

		if (this.exiv_comment != this.calculatedTS.comment && this.calculatedTS.comment) {
			const c = this.calculatedTS.comment;
			res = res && await messages.fileCommit(this, 'EXIV_WRITE_COMMENT', 'Write comment', c, () => this.exivWriteComment(c));
		}

		if (this.exiv_timestamp.TS() != this.calculatedTS.TS() && this.calculatedTS.TS()) {
			res = res && await messages.fileCommit(this, 'EXIV_WRITE_TIMESTAMP', 'Write timestamp', this.calculatedTS.TS(), () => this.exivWriteTimestamp(this.calculatedTS.TS()));
		}
		return res;
	}
};
