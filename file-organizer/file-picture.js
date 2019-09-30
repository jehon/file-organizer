
const messages = require('./messages.js');
const FileExiv = require('./file-exiv.js');
const { fileExec, fileRename, fileDelete } = require('./file-utils.js');

module.exports = class FilePicture extends FileExiv {
	async exivRotatePicture() {
		// _angle is not used because exiftran calculate that for us...

		// exiftran:
		// '-g': regenerate thumbnail
		// '-p': preserve file atime/mtime
		// '-a': auto rotate
		// '-i': inplace

		const orig = this.getRelativePath();
		const temp = this.getRelativePath() + '.rotated';

		return fileExec('exiftran', [ '-a', '-p', '-g', orig, '-o', temp ])
			.then(() => fileExec('touch', [ '-r', orig, temp]))
			.then(() => fileDelete(orig))
			.then(() => fileRename(temp, orig))
			.then(() => this.exiv_orientation = 0)
			.then(() => true);
	}

	async check() {
		let res = true;
		if (!await super.check()) {
			return false;
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
