
import { execFile } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';
import { fileDelete } from '../fs-utils.js';
import { glob2regExp, registerRegExp } from '../register-file-types.js';
import FileExif from './file-exif.js';
import File from './file.js';

const pExecFile = promisify(execFile);

/**
 * @param {FilePicture} file to be rotated
 */
async function exifRotatePicture(file) {
    // _angle is not used because exiftran calculate that for us...

    // exiftran:
    // '-g': regenerate thumbnail
    // '-p': preserve file atime/mtime
    // '-a': auto rotate
    // '-i': inplace

    const orig = file.currentFilePath;
    const temp = file.currentFilePath + '.rotated';

    await pExecFile('exiftran', ['-a', '-p', '-g', orig, '-o', temp]);
    await pExecFile('touch', ['-r', orig, temp]);
    await fileDelete(new File(orig));
    await fs.promises.rename(temp, orig);
    await file.get(FileExif.I_FE_ORIENTATION).fix();

    file.get(FileExif.I_FE_ORIENTATION).fix(0);
}

export default class FilePicture extends FileExif {
    async analyse() {
        await super.analyse();

        if (this.get(File.I_EXTENSION).expected == '.jpeg') {
            this.get(File.I_EXTENSION).expect('.jpg', 'normalize to 3 letters extension');
        }
    }

    async act() {
        await super.act();

        // Rotate according to exif tag
        if (!this.get(FileExif.I_FE_ORIENTATION).isDone()) {
            await exifRotatePicture(this);
        }
    }
}

registerRegExp([
    glob2regExp('*.jpg'),
    glob2regExp('*.jpeg')
], FilePicture, { forFiles: true });

// case '.mts':  // ?   // TODO (extensions): unsupported
// case '.png':  // ?   // TODO (extensions): unsupported
// case '.dng':  // ?   // TODO (extensions): unsupported
