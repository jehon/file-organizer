
var spawnSync = require('child_process').spawnSync;

const messages = require('./messages.js');
const FileTimestamped = require('./file-timestamped.js');
const { tsFromString } = require('./timestamp.js');
const { fileExec, fileRename, fileDelete } = require('./file-utils.js');
const BusinessError = require('./business-error.js');

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

module.exports = class FilePicture extends FileTimestamped {
	constructor(filePath) {
		super(filePath);

		this.exivReload();

		this.setCalculatedTS(this.exiv_ts);
		if (this.exiv_comment) {
			this.calculatedTS.comment = this.exiv_comment;
		}
	}

	exivReload(){
		this.exiv_timestamp        = this._exivReadTimestamp();
		this.exiv_comment          = this._exivReadComment();
		this.exiv_orientation      = this._exivReadOrientation();
		this.exiv_ts               = tsFromString(this.exiv_timestamp);

		this.addInfo('picture.exiv.timestamp',   this.exiv_timestamp);
		this.addInfo('picture.exiv.comment',     this.exiv_comment);
		this.addInfo('picture.exiv.orientation', this.exiv_orientation);
	}

	_exivReadTimestamp() {
		const data = runExiv('-g', 'Exif.Photo.DateTimeOriginal', this.getRelativePath());
		let res = data
			.substr(60)
			.split('\n').join('')
			.split(':').join('-');

		return res ? res : null;
	}

	_exivReadComment() {
		const data = runExiv('-g', 'Exif.Photo.UserComment', this.getRelativePath());
		let res = data
			.substr(60)
			.split('\n').join('')
			.replace(/\0/g, '')
			.trim();

		if (res == '(Binary value suppressed)') {
			res = '';
		}

		return res ? res : '';
	}

	_exivReadOrientation() {
		const data = runExiv('-g', 'Exif.Image.Orientation', this.getRelativePath());
		let res = data
			.substr(60)
			.split('\n').join('');

		switch(res) {
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
			throw new BusinessError(`exivReadRotation: could not understand value: ${res} in ${this.getRelativePath()}`);
		}
	}

	exivWriteTimestamp(ts) {
		const empty = '0000-00-01 00-00-00';
		if (ts.length < empty.length) {
			ts = ts + empty.substr(ts.length);
			messages.fileInfo(this, 'PICT_UPGRADE_TIMESTAMP', 'Update timestamp to ' + ts);
		}

		runExiv('modify', '-M set Exif.Photo.DateTimeOriginal ' + ts.split('-').join(':'), this.getRelativePath());
		this.exiv_timestamp = ts;
		this.setCalculatedTS(ts);
	}

	exivWriteComment(msg) {
		runExiv('modify', '-M set Exif.Photo.UserComment ' + msg, this.getRelativePath());
		this.exiv_comment = msg;
		this.calculatedTS.comment = msg;
	}

	async exivRotatePicture() {
		// _angle is not used because exiftran calculate that for us...

		// exiftran:
		// '-g': regenerate thumbnail
		// '-p': preserve file atime/mtime
		// '-a': auto rotate
		// '-i': inplace

		const orig = this.getRelativePath();
		const temp = this.getRelativePath() + '.rotated';

		await fileExec('exiftran', [ '-a', '-p', '-g', orig, '-o', temp ]);
		await fileExec('touch', [ '-r', orig, temp]);
		await fileDelete(orig);
		await fileRename(temp, orig);

		this.exiv_orientation = 0;
		return true;
	}

	async check() {
		let res = true;
		if (!this.exiv_timestamp) {
			res = res && messages.fileImpossible(this, 'PICT_NO_DATE', 'Exiv: no date found');
		}

		if (!res) {
			return res;
		}

		if (!await super.check()) {
			return false;
		}

		if (this.exiv_comment != this.calculatedTS.comment && this.calculatedTS.comment) {
			const c = this.calculatedTS.comment;
			res = res && await messages.fileCommit(this, 'PICT_WRITE_COMMENT', 'Write comment', c, () => this.exivWriteComment(c));
		}

		if (this.exiv_timestamp != this.calculatedTS.TS() && this.calculatedTS.TS()) {
			res = res && await messages.fileCommit(this, 'PICT_WRITE_TIMESTAMP', 'Write timestamp', this.calculatedTS.TS(), () => this.exivWriteTimestamp(this.calculatedTS.TS()));
		}

		// Rotate according to exiv tag
		if (this.exiv_orientation != 0) {
			await messages.fileCommit(this, 'PICT_ROTATE', 'rotate picture',
				this.exiv_orientation,
				() => this.exivRotatePicture()
			);
		}
		return res;
	}
};
