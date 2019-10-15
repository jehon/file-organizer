
const FileExiv = require('./file-exiv.js');
const { tsFromDateAndTimezone } = require('./timestamp.js');
// const fileUtils = require('./file-utils.js');

module.exports = class FileMovie extends FileExiv {
	get type() { return 'movie'; }
	get constExivTS() { return 'CreateDate'; }

	check() {
	// 	this.addMessageConvert(
	// 		'CONVERT_MOV',
	// 		'.mov',
	// 		(originalPath, targetPath) =>
	// 			// ffmpeg -i <name>.avi <name>.mov
	// 			fileUtils.fileExec('ffmpeg', '-i', originalPath, targetPath)
	// 				// exiftool -TagsFromFile <name>.avi <name>.mov
	// 				.then(() => fileUtils.fileExec('exiftool', '-TagsFromFile', originalPath, targetPath)),
	// 	);
		return super.check();
	}

	async exivReadAll(file) {
		return super.exivReadAll(file)
			.then(exivData => {
				if (!exivData[this.constExivTS] && exivData.DateTimeOriginal) {
					exivData[this.constExivTS] = exivData.DateTimeOriginal;
				}
				if (exivData.calculatedTimezone) {
					exivData[this.constExivTS] = tsFromDateAndTimezone(exivData[this.constExivTS].replace(':', '-').replace(':', '-'), exivData.calculatedTimezone).TS();
				}
				return exivData;
			});
	}

	async exivWriteTimestamp(ts) {
		if (this.calculatedTimezone) {
			throw new Error('Movie write timestamp not implemented');
		}
		return super.exivWriteTimestamp(ts);
	}
};
