
var spawnSync = require('child_process').spawnSync;

const messages = require('./messages.js');
const FileTimestamped = require('./file-timestamped.js');
const { tsFromString } = require('./timestamp.js');
const BusinessError = require('./business-error.js');

const technicalTags = new Map();
technicalTags.set('UserComment',      'Exif.Photo.UserComment');
technicalTags.set('DateTimeOriginal', 'Exif.Photo.DateTimeOriginal');
technicalTags.set('Orientation',      'Exif.Image.Orientation');

function getByValue(map, searchValue) {
	for (let [key, value] of map.entries()) {
		if (value === searchValue)
			return key;
	}
	return searchValue;
}

function runExiv(...params) {
	//
	// Error here ? check exiv is installed :-)
	//
	let processResult = spawnSync('exiv2', params);
	switch(processResult.status) {
	case 0:   // ok, continue
		break;
	case 1:   // The file contains data of an unknown image type
	case 253: // No exif data found in file
		return '';
	case 255: // File does not exists
		return '';
	default:
		throw new BusinessError('\n\nrunExiv process: ' + processResult.status + ' with [ ' + params.join(' , ') + ' ] => ' + processResult.stderr.toString());
	}
	if (processResult.stdout != null) {
		return processResult.stdout.toString();
	}
	return '';
}

function exivWrite(file, tag, value) {
	return runExiv('modify',`-M set ${technicalTags.get(tag)} ${value}`, file.getRelativePath());
}

function exivReadAll(file) {
	const data = runExiv('-g', 'Exif.*', file.getRelativePath());
	const result = {
		'UserComment': '',
		'DateTimeOriginal': '',
		'Orientation': ''
	};
	data.split('\n').forEach(line => {
		const kraw = line.split(' ')[0].trim();
		const k = getByValue(technicalTags, kraw);
		let v = line.substr(60).replace(/\0/g, '').trim();
		if (v == '(Binary value suppressed)') {
			v = '';
		}
		if (v) {
			result[k] = v;
		}
	});
	return result;
}

function translateRotation(rotation) {
	switch(rotation) {
	// What is the top-left corner?
	case 'left, bottom':
		// https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_8.jpg
		return 270;

	case 'right, top':
		// https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_6.jpg
		return 90;

	case 'bottom, right':
		// https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_3.jpg
		return 180;

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

	exivReload(){
		const exivData = exivReadAll(this);

		this.exiv_timestamp_raw    = exivData['DateTimeOriginal'];
		this.exiv_timestamp        = tsFromString(exivData['DateTimeOriginal'].split(':').join('-'));
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
