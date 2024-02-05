import fs from "node:fs";
import path from "node:path";

import { EXCLUDED_FILENAMES } from "../lib/constants";
import { myExecFileSync } from "./exec-helper";

export type RelativePathCalculation = (...subPath: string[]) => string;

export function fsFileExists(filepath: string): boolean {
  try {
    fs.statSync(filepath);
    return true;
  } catch (e) {
    return false;
  }
}

export function fsIsFolder(filepath: string): boolean {
  return fs.statSync(filepath).isDirectory();
}

/**
 * This function handle special cases:
 *   - same case
 *   - test for destination existance (error)
 *
 * Throw in case the final file already exists
 */
export function fsFileRename(
  filepathOriginal: string,
  filepathDest: string
): void {
  if (filepathOriginal == filepathDest) {
    return;
  }

  if (!fsFileExists(filepathOriginal)) {
    throw new Error(
      `internalFileRename: source file ${filepathOriginal} does not exists`
    );
  }

  const dFolder = path.dirname(path.dirname(filepathDest));
  if (!fsFileExists(dFolder)) {
    throw new Error(
      `internalFileRename: destination folder ${dFolder} does not exists`
    );
  }

  if (filepathOriginal.toUpperCase() == filepathDest.toUpperCase()) {
    fsFileRename(filepathOriginal, filepathOriginal + ".case");
    fsFileRename(filepathOriginal + ".case", filepathDest);
    return;
  }

  if (fsFileExists(filepathDest)) {
    throw new Error(
      `internalFileRename: A file with the same name already exists (${filepathDest} from ${filepathOriginal})`
    );
  }

  fs.renameSync(filepathOriginal, filepathDest);
}

/**
 * This function is used in constructor, so it must be SYNC
 *
 * If filepath is not a folder, return an empty list []
 *
 * @returns {string[]} of basename of files/folders in the folder
 */
export function fsFolderListing(filepath: string): string[] {
  if (!fsIsFolder(filepath)) {
    return [];
  }
  return fs
    .readdirSync(filepath)
    .filter((f) => f != "." && f != ".." && f !== null)
    .sort();
}

/**
 * @returns {string[]} of relative filepath (given filepath is included)
 */
export function fsFolderListingRecursively(filepath: string): string[] {
  if (filepath === null) {
    return [];
  }
  return [
    // usself
    filepath,

    // childrend's if any (otherwise get [])
    ...fsFolderListing(filepath)
      .filter((filename) =>
        EXCLUDED_FILENAMES.map(
          (e) => (e instanceof RegExp && e.test(filename)) || e == filename
        ).reduce((init, val) => init && !val, true)
      )
      // Relative path
      .map((fn) => path.join(filepath, fn))

      // With descendants
      .map((f) => fsFolderListingRecursively(f))

      // [ fp, [f1+], [f2+] ] => [ fp, ...f1+, ...f2+ ]
      .flat(1)
  ].sort();
}

export const waitForFileToExists = (
  filepath: string,
  timeOutSecs: number = 15
) => {
  let passes = 0;
  do {
    if (fs.existsSync(filepath)) {
      return true;
    }
    myExecFileSync("sleep", ["1s"]);
    passes++;
  } while (passes < timeOutSecs);

  return false;
};
