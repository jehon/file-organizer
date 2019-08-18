
const fs = require('fs');
const path = require('path');

const FileGeneric = require('./file-generic.js');
const FileFolder  = require('./file-folder.js');

const FileDelete  = require('./file-delete.js');
const FileHidden  = require('./file-hidden.js');
const FileMovie   = require('./file-movie.js');
const FilePicture = require('./file-picture.js');

function FileFactory(filepath) {
	let filename = path.parse(filepath).base;

	// Get the "file" relative or parent relative:
	const f = new FileGeneric(filepath);

	switch (filename) {
	case '@eaDir':
	case '#recycle':
		return new FileHidden(filepath);
	case 'Thumbs.db':
	case '.picasa.ini':
		return new FileDelete(filepath);
	}

	try {
		// Is it real? Let's go further
		if (fs.statSync(f.getRelativePath()).isDirectory()) {
			return new FileFolder(filepath);
		}
	} catch(e) {
		// ok
	}

	switch (f.getExtension().toLowerCase()) {
	case '.jpg':
	case '.jpeg':
		return new FilePicture(filepath);
	case '.mov':
	case '.mpeg':
	case '.mpg':
	case '.mp4':
	case '.m4v':
	case '.mkv':
	case '.avi':
		return new FileMovie(filepath);
	}

	// Fallback: generic file
	return f;
}

module.exports = FileFactory;
