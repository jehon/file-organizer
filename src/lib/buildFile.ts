import fs from "node:fs";
import path from "node:path";
import convertMixin from "../file-types/convert-mixin";
import File from "../file-types/file";
import FileDelete from "../file-types/file-delete";
import { FileFallback } from "../file-types/file-fallback";
import FileFolder, {
  getFolderByName,
  getParentOf
} from "../file-types/file-folder";
import FileHidden from "../file-types/file-hidden";
import FileMovie from "../file-types/file-movie";
import FileMovieUTC from "../file-types/file-movie-utc";
import FilePicture from "../file-types/file-picture";
import { myExecFileSync } from "../helpers/exec-helper";
import { fsIsFolder } from "../helpers/fs-helpers";

export function buildFileAs<T extends File>(
  filepath: string,
  type: new (fn: string, p: FileFolder) => T
): T {
  filepath = path.resolve(filepath);

  if (filepath == "/") {
    throw new Error("Could not buildFile on top folder");
  }

  const parent = getParentOf(filepath);
  // const basename = path.parse(filepath).base;

  // Only place where we build File* except for Folders
  return new type(path.basename(filepath), parent);
}

/**
 * This function is called in constructor of File, so it must be SYNC
 */
export default function buildFile(filepath: string): File {
  filepath = path.resolve(filepath);

  if (filepath == "/") {
    throw new Error("Could not buildFile on top folder");
  }

  const basename = path.parse(filepath).base;
  let type = null;

  switch (true) {
    // Include folders that should be Hidden
    case "#recycle" == basename:
    case "@eaDir" == basename:
    case "." == basename[0]: // Files starting with .blablabla
      type = FileHidden;
      break;

    case fsIsFolder(filepath):
      return getFolderByName(filepath);

    //
    // Other files are handled from here
    //

    case /^[^.]+$/i.test(basename): // Files without extension
      type = FileHidden;
      break;

    case fs.statSync(filepath).size == 0:
    case "Thumbs.db" == basename:
      type = FileDelete;
      break;

    case basename.toLowerCase().endsWith(".mov"):
      type = FileMovie;
      break;

    case basename.toLowerCase().endsWith(".mp4"):
      type = FileMovieUTC;
      break;

    // case basename.toLowerCase().endsWith(".mts"):
    case basename.toLowerCase().endsWith(".mpg"):
    case basename.toLowerCase().endsWith(".mpeg"):
      type = convertMixin(FileMovieUTC, ".mp4", (oldFn, newFn) =>
        myExecFileSync("ffmpeg", ["-i", oldFn, "-c", "copy", newFn])
      );
      break;

    case basename.toLowerCase().endsWith(".jpg"):
    case basename.toLowerCase().endsWith(".jpeg"):
      type = FilePicture;
      break;

    case basename.toLowerCase().endsWith(".png"):
      type = convertMixin(FilePicture, ".jpg", (oldFn, newFn) =>
        myExecFileSync("convert", [oldFn, newFn])
      );
      break;

    case basename.toLowerCase().endsWith(".pdf"):
    case basename.toLowerCase().endsWith(".doc"):
      type = File;
      break;

    default:
      type = FileFallback;
      break;
  }
  return buildFileAs(filepath, type);
}
