
const fs = require('fs');

const fileUtils = require('./file-utils.js');
const FileGeneric = require('./file-generic.js');
const FileFolder = require('./file-folder.js');

const FileDelete = require('./file-delete.js');
const FileHidden = require('./main/file-hidden.js');
const FileManual = require('./file-manual.js');
const FileMovie = require('./file-movie.js');
const FilePicture = require('./file-picture.js');
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
        case '.mp4':  // 67  // TODO (extensions): unsupported
            return new FileMovie(filepath, parent);

        // case '.avi':  // 17  // TODO (extensions): unsupported
        // case '.mpg':  // 29  // TODO (extensions): unsupported
        // case '.mpeg': // ?   // TODO (extensions): unsupported
        // case '.wmv':  // ?   // TODO (extensions): unsupported
        // case '.mod':  // ?   // TODO (extensions): unsupported
        // return new FileMovieMov(filepath, parent);

        // case '.m4v':  // 11  // TODO (extensions): unsupported
        // case '.mkv':  // 1   // TODO (extensions): unsupported
        // return new FileMovieMP4(filepath, parent);

        // case '.mts':  // ?   // TODO (extensions): unsupported
        // case '.png':  // ?   // TODO (extensions): unsupported
        // case '.dng':  // ?   // TODO (extensions): unsupported
    }
    return new FileUnsupported(filepath, parent);
}

module.exports = fileFactory;
