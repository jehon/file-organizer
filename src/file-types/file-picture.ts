import fs from "node:fs";
import { myExecFileSync } from "../helpers/exec-helper";
import FileExif from "./file-exif";
import FileFolder from "./file-folder";

async function exifRotatePicture(file: FilePicture) {
  // _angle is not used because exiftran calculate that for us...

  // exiftran:
  // '-g': regenerate thumbnail
  // '-p': preserve file atime/mtime
  // '-a': auto rotate
  // '-i': inplace

  const orig = file.currentFilepath;
  const temp = file.currentFilepath + ".rotated";

  myExecFileSync("exiftran", ["-a", "-p", "-g", orig, "-o", temp]);
  myExecFileSync("touch", ["-r", orig, temp]);
  await fs.promises.unlink(orig);
  await fs.promises.rename(temp, orig);

  file.i_fe_orientation.fixed();
}

export default class FilePicture extends FileExif {
  constructor(filename: string, parent: FileFolder) {
    super(filename, parent);

    if (this.i_f_extension.expected == ".jpeg") {
      this.i_f_extension.expect(
        ".jpg",
        "FilePicture: normalize to 3 letters extension"
      );
    }

    this.i_fe_orientation
      .withExpectedFrozen(0, "Picture must be top oriented")
      .withFix(() => exifRotatePicture(this));

    return this;
  }
}
