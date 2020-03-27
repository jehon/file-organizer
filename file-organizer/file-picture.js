
const FileExif = require('./file-exif.js');
const fileUtils = require('./file-utils.js');

module.exports = class FilePicture extends FileExif {
    async exifRotatePicture() {
        // _angle is not used because exiftran calculate that for us...

        // exiftran:
        // '-g': regenerate thumbnail
        // '-p': preserve file atime/mtime
        // '-a': auto rotate
        // '-i': inplace

        const orig = this.getPath();
        const temp = this.getPath() + '.rotated';

        return fileUtils.fileExec('exiftran', [ '-a', '-p', '-g', orig, '-o', temp ])
            .then(() => fileUtils.fileExec('touch', [ '-r', orig, temp ]))
            .then(() => fileUtils.fileDelete(orig))
            .then(() => fileUtils.fileRename(temp, orig))
            .then(() => this.exif_orientation = 0)
            .then(() => true);
    }

    async check() {
        let res = true;
        if (!await super.check()) {
            return false;
        }

        // Rotate according to exif tag
        if (this.exif_orientation != 0) {
            await this.addMessageCommit('PICT_ROTATE', 'rotate picture',
                this.exif_orientation,
                () => this.exifRotatePicture()
            );
        }
        return res;
    }
};
