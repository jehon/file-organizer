//
//  See https://www.sno.phy.queensu.ca/~phil/exiftool/#supported
//  QuickTime -> mov?
//
// According to the specification, many QuickTime date/time tags should be stored as UTC.
// Unfortunately, digital cameras often store local time values instead (presumably because
// they don't know the time zone). For this reason, by default ExifTool does not assume
// a time zone for these values. However, if the QuickTimeUTC API option is set, then ExifTool
// will assume these values are properly stored as UTC, and will convert them to local time when extracting.
//
//

import FileExif from "./file-exif";

export default class FileMovie extends FileExif {
  get EXIF_TS() {
    return "CreateDate";
  }
}
