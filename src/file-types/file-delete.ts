import File from "./file";
import FileFolder from "./file-folder";

export default class FileDelete extends File {
  constructor(filename: string, parent: FileFolder) {
    super(filename, parent);

    // By setting any one of these to null
    // the file will be deleted
    this.i_00_f_exists.withExpectedFrozen(false, "FileDelete: delete");
  }
}
