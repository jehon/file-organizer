
const fs = require('fs');

const fileUtils         = require('./file-utils.js');
const FileGeneric       = require('./file-generic.js');
const FileFolder        = require('./file-folder.js');

const FileDelete        = require('./file-delete.js');
const FileHidden        = require('./file-hidden.js');
const FileManual        = require('./file-manual.js');
const FileMovie         = require('./file-movie.js');
const FileMovieUTC      = require('./file-movie-utc.js');
const FilePicture       = require('./file-picture.js');
const FileConvertSource = require('./file-convert-source.js');

const FileUnsupported = require('./file-unsupported.js');

async function fileFactory(filepath, parent = null) {
	if (filepath instanceof FileGeneric) {
		return filepath;
	}

	// File infos
	const fname = fileUtils.getFullFilename(filepath);
	const fext = fileUtils.getExtension(filepath).toLowerCase();

	// By filename:
	switch (fname) {
	case '#recycle':
	case '@eaDir':
		return new FileHidden(filepath, parent);
	case 'Thumbs.db':
	case '.picasa.ini':
		return new FileDelete(filepath, parent);
	}

	if (fname != '.' && (fname[0] == '.' || fext == '.')) {
		// Skip '.xxx'
		// Skip 'xxx' (no extension)
		return new FileHidden(filepath, parent);
	}
	if (fname.endsWith(FileGeneric.convertedSuffix)) {
		return new FileConvertSource(filepath, parent);
	}

	try {
		// Is it real? Let's go further

		// TODO (async): render this async !
		const stat = await fs.promises.stat(filepath);
		if (stat.isDirectory()) {
			return new FileFolder(filepath, parent);
		}
	} catch {
	// ok
	}

	// By extension
	switch (fext) {
	case '.pdf':
	case '.txt':
		return new FileGeneric(filepath, parent);
	case '.doc*':
		return new FileManual(filepath, parent);
	case '.jpg':
	case '.jpeg':
		return new FilePicture(filepath, parent);
	case '.mov':
	case '.m4v': // --> convert to MP4 ? // https://www.winxdvd.com/resource/m4v-vs-mp4.htm ==> change extension
		return new FileMovie(filepath, parent);
	case '.mp4': // --> but convert inside to H264 ?
		return new FileMovieUTC(filepath, parent);

		// Thanks to https://stackoverflow.com/a/40077776/1954789
		// does not work everytimes...
		// case '.mkv': --> ffmpeg -i filename.mkv -vcodec copy -acodec copy 1.m4v
		// case '.mkv': --> ffmpeg -i filename.mkv -c copy 1.m4v

	// case '.mpg':
	// case '.avi':
	// case '.mpeg':
	// case '.mts':
	// case '.mod':
	// case '.png':
	// case '.wmv':
	// case '.dng':
		// TODO (extensions): unsupported
	}
	return new FileUnsupported(filepath, parent);
}

module.exports = fileFactory;
