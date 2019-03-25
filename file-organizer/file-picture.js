
var spawnSync = require('child_process').spawnSync;

const options = require('./options.js');
const FileTimestamped = require('./file-timestamped.js');
const { tsFromString } = require('./timestamp.js');
const { fileExec, fileRename, fileDelete } = require('./file-utils.js');
const BusinessError = require('./business-error.js');

function runExiv(...params) {
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

		this.exiv_date        = this.exivReadDate();
		this.exiv_comment     = this.exivReadComment();
		this.exiv_orientation = this.exivReadOrientation();

		this.exiv_ts          = tsFromString(this.exivReadDate());

		this.addInfo('picture.exiv.timestamp',   this.exiv_date);
		this.addInfo('picture.exiv.comment',     this.exiv_comment);
		this.addInfo('picture.exiv.orientation', this.exiv_orientation);
	}

	exivReadDate() {
		const data = runExiv('-g', 'Exif.Photo.DateTimeOriginal', this.getRelativePath());
		let res = data
			.substr(60)
			.split('\n').join('')
			.split(':').join('-');

		return res ? res : null;
	}

	exivReadComment() {
		const data = runExiv('-g', 'Exif.Photo.UserComment', this.getRelativePath());
		let res = data
			.substr(60)
			.split('\n').join('')
			.replace(/\0/g, '')
			.trim();

		return res ? res : '';
	}

	exivReadOrientation() {
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

	exivWriteComment(msg) {
		runExiv('modify', '-M set Exif.Photo.UserComment ' + msg, this.getRelativePath());
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
		return true;
	}

	async check() {
		let res = true;
		if (!this.exiv_date) {
			res = res & this.checkMsg('ERR', 'Exiv: no date found');
		}

		if (options.guessComment) {
			let c = this.calculatedTS.comment;
			if (!c) {
				c = this.parent.calculatedTS.comment;
			}
			// TODO: to be tested...
			res = res & this.checkMsg('ERR', 'guess and write comment', c, () => this.exivWriteComment(c));
		} else {
			if (!this.exiv_comment) {
				res = res & this.checkMsg('ERR', 'Exiv: no comment found');
			}
		}

		if (!res) {
			return res;
		}

		// const proposedComment = this.getFilenameTimestamp().comment;
		// if (comment == '') {
		// 	await this.checkMsg(
		// 		'Set the comment of the picture',
		// 		proposedComment,
		// 		() => this.exivWriteComment(proposedComment)
		// 	);
		// }

		// if (options.forcePictureOverrideComment) {
		// 	if (comment != proposedComment) {
		// 		await this.checkMsg(allOptions.forcePictureOverrideComment,
		// 			'Override the comment of the picture',
		// 			proposedComment,
		// 			() => this.exivWriteComment(proposedComment)
		// 		);
		// 	}
		// }

		if (!await super.check()) {
			return false;
		}

		// Rotate according to exiv tag
		if (this.exiv_orientation != 0) {
			await this.checkMsg('ERR', 'rotate picture',
				this.exiv_orientation,
				() => this.exivRotatePicture()
			);
		}
		return res;
	}
};
