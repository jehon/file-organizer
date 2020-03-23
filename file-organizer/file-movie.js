
const FileExif = require('./file-exif.js');
const { tsFromExif, tzFromGPS } = require('./timestamp.js');

module.exports = class FileMovie extends FileExif {
    get constExifTS() { return 'CreateDate'; }

    async exifReadAll(file) {
        return super.exifReadAll(file)
            .then(exifData => {
                if (exifData.GPSPosition) {
                    exifData.calculatedTimezone = tzFromGPS(exifData.GPSPosition);
                }
                return exifData;
            });
    }

    async exifReload() {
        return super.exifReload().then(exifData => {
            this.exif_calculated_timezone = exifData.calculatedTimezone;
            this.exif_timestamp           = tsFromExif(exifData[this.constExifTS], this.exif_calculated_timezone);
            return exifData;
        });
    }

    async check() {
        return super.check();

        // // TODO: here, we should write it in "check"
        // if (!exifData[this.constExifTS] && exifData.DateTimeOriginal) {
        // 	exifData[this.constExifTS] = exifData.DateTimeOriginal;
        // }
    }

    async exifWriteTimestamp(ts_original) {
        const ts = ts_original.clone();
        if (this.exif_calculated_timezone) {
            ts.moment = ts.moment.tz(this.exif_calculated_timezone, true);
        }
        return super.exifWriteTimestamp(ts);
    }
};
