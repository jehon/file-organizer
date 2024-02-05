import FileMovie from "./file-movie";

export default class FileMovieUTC extends FileMovie {
  get EXIF_TS_STORED_IN_UTC() {
    return true;
  }
}
