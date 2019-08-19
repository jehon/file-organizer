
const fs = require('fs');
const path = require('path');

const FileGeneric = require('./file-generic.js');
const FileFolder  = require('./file-folder.js');

const FileDelete  = require('./file-delete.js');
const FileHidden  = require('./file-hidden.js');
const FileMovie   = require('./file-movie.js');
const FilePicture = require('./file-picture.js');

function FileFactory(filepath, parent = false) {
	let filename = path.parse(filepath).base;

	// Get the "file" relative or parent relative:
	let f = new FileGeneric(filepath);

	// By filename:
	switch (filename) {
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
			if (fs.statSync(f.getRelativePath()).isDirectory()) {
				f = new FileFolder(filepath);
				break;
			}
		} catch {
			// ok
		}

		// By extension
		switch (f.getExtension().toLowerCase()) {
		case '.jpg':
		case '.jpeg':
			f = new FilePicture(filepath);
			break;
		case '.mov':
		case '.mpeg':
		case '.mpg':
		case '.mp4':
		case '.m4v':
		case '.mkv':
		case '.avi':
			f = new FileMovie(filepath);
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
