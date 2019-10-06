
const fs = require('fs');

const FileGeneric     = require('./file-generic.js');
const FileFolder      = require('./file-folder.js');

const FileDelete      = require('./file-delete.js');
const FileHidden      = require('./file-hidden.js');
const FileMovie       = require('./file-movie.js');
const FileMovieUTC    = require('./file-movie-utc.js');
const FilePicture     = require('./file-picture.js');

const FileUnsupported = require('./file-unsupported.js');

async function fileFactory(filepath, parent = false) {
	if (filepath instanceof FileGeneric) {
		return filepath;
	}
	// Target
	let f = null;

	// File infos
	const fname = FileGeneric.getFullFilename(filepath);
	const fext = FileGeneric.getExtension(filepath).toLowerCase();

	// By filename:
	switch (fname) {
	case '#recycle':
	case '@eaDir':
		f = new FileHidden(filepath);
		break;
	case 'Thumbs.db':
	case '.picasa.ini':
		f = new FileDelete(filepath);
		break;
	default:
		if (fname != '.' && (fname[0] == '.' || fext == '.')) {
			// Skip '.xxx'
			// Skip 'xxx' (no extension)
			f = new FileHidden(filepath);
		} else {
			try {
				// Is it real? Let's go further
				if (fs.statSync(filepath).isDirectory()) {
					f = new FileFolder(filepath);
					break;
				}
			} catch {
			// ok
			}

			// By extension
			switch (fext) {
			case '.txt':
				f = new FileGeneric(filepath);
				break;
			case '.jpg':
			case '.jpeg':
				f = new FilePicture(filepath);
				break;
			case '.mov':
			case '.m4v':
				f = new FileMovie(filepath);
				break;
			case '.mp4':
				f = new FileMovieUTC(filepath);
				break;

			// case '.mpg':
			// case '.avi':
			// case '.mpeg':
			// case '.mkv':
			// case '.mts':
			// case '.mod':
			// case '.png':
			// case '.wmv':
			// case '.dng':
				// TODO (extensions): unsupported
			default:
				f = new FileUnsupported(filepath);
				break;

			}
		}
	}
	if (parent) {
		f._parent = parent;
	}

	// Fallback: generic file
	return f;
}

module.exports = fileFactory;
