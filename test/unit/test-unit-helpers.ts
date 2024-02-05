import fs from "node:fs";
import path from "node:path";
import { getParentOf } from "../../src/file-types/file-folder";
import { fsFileExists } from "../../src/helpers/fs-helpers";
import {
  createFileFromTo,
  rootPath,
  tempPathCommon
} from "../test-common-helpers";

export {
  assertIsEqual,
  filenameIsA,
  fromCWD,
  iFilename
} from "../test-common-helpers";

export const dataPathUnit = (...args: string[]) =>
  rootPath("test", "unit", "data", ...args);

export const tempPathUnit = (...args: string[]) =>
  tempPathCommon("unit", ...args);

export function createFileFromDataUnit(
  subPath: string,
  inFolderWithinTmp: string = ""
): string {
  const folderpath = tempPathUnit(inFolderWithinTmp);
  createFolderRecursively(folderpath);

  const filepath = createFileFromTo(folderpath, dataPathUnit(subPath));
  getParentOf(filepath)._addNewlyCreateFile(path.basename(filepath));

  return filepath;
}

export function createEmptyUnitFile(...filepaths: string[]): string {
  const filepath = tempPathUnit(...filepaths);
  const folderpath = path.dirname(filepath);

  // Create parent folder:
  createFolderRecursively(folderpath);
  // Touch:
  fs.closeSync(fs.openSync(filepath, "w"));

  getParentOf(filepath)._addNewlyCreateFile(path.basename(filepath));

  return filepath;
}

export function createFolderRecursively(folderpath: string): void {
  if (fsFileExists(folderpath)) {
    return;
  }

  createFolderRecursively(path.dirname(folderpath));

  const parent = getParentOf(folderpath);
  parent._addNewlyCreateFile(path.basename(folderpath));
  fs.mkdirSync(folderpath);
}
