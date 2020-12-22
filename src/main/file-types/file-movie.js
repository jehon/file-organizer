
import { registerRegExp, glob2regExp } from '../register-file-types.js';
import FileExif from './file-exif.js';

export default class FileMovie extends FileExif {
    get EXIF_TS() { return 'CreateDate'; }
    get EXIF_TS_IS_UTC() { return true; }
}

registerRegExp([
    glob2regExp('*.mov'),
    glob2regExp('*.mp4')
], FileMovie, { forFiles: true });

// Convert all theses ???
// case '.avi':  // 17  // TODO (extensions): unsupported
// case '.mpg':  // 29  // TODO (extensions): unsupported
// case '.mpeg': // ?   // TODO (extensions): unsupported
// case '.wmv':  // ?   // TODO (extensions): unsupported
// case '.mod':  // ?   // TODO (extensions): unsupported
// return new FileMovieMov(filepath, parent);

// Convert all theses ???
// case '.m4v':  // 11  // TODO (extensions): unsupported
// case '.mkv':  // 1   // TODO (extensions): unsupported
// return new FileMovieMP4(filepath, parent);
