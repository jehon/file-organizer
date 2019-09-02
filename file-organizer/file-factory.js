
const fs = require('fs');

const FileGeneric = require('./file-generic.js');
const FileFolder  = require('./file-folder.js');

const FileDelete  = require('./file-delete.js');
const FileHidden  = require('./file-hidden.js');
const FileMovie   = require('./file-movie.js');
const FilePicture = require('./file-picture.js');

function FileFactory(filepath, parent = false) {
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
			// TODO: is this ok?
			f = new FileGeneric(filepath);
			break;
		case '.jpg':
		case '.jpeg':
			f = new FilePicture(filepath);
			break;
		case '.mov':
		case '.mpg':
		case '.avi':
		case '.mp4':
			// case '.mpeg':
			// case '.m4v':
			// case '.mkv':
			f = new FileMovie(filepath);
			break;
		default:
			f = new FileGeneric(filepath);
			console.error('Unknown file type: ', fext, ' in ', filepath);
			break;

		}
	}

	if (parent) {
		f._parent = parent;
	}

	// Fallback: generic file
	return f;
}

module.exports = FileFactory;
