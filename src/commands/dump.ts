import chalk from "chalk";
import path from "path";
import File from "../file-types/file";
import FileExif from "../file-types/file-exif";
import {
  OptionsHandleAllFiles,
  OptionsHandleOneFile,
  handleAllFiles
} from "../helpers/command-helper";
import { IconFailure, IconSuccess, writeLine } from "../helpers/tui-helpers";

export const command = "dump [files..]";

export const describe = "Get some info about the files";

export const builder = {
  errorOnly: {
    alias: ["error-only", "e"],
    type: "boolean",
    default: false
  }
};

const padFilename = 60;
const padType = 12;
const padExtension = 5;
const padTimestamp = 22;
const padTitle = 50;

/**
 * Pad string to left
 */
function l(str: string, ll: number): string {
  str = "" + str;
  if (str.length > ll) {
    str = str.slice(0, ll - 1) + "…";
  }
  return str.padEnd(ll);
}

/**
 * Pad string to right
 */
function r(str: string, ll: number): string {
  if (str.length > ll) {
    str = "…" + str.slice(-ll + 1) + "";
  }
  return str.padEnd(ll);
}

export function handler(globalOptions: OptionsHandleAllFiles): Promise<void> {
  console.info(
    "  " +
      l("filename", padFilename) +
      "|" +
      l("type", padType) +
      "|" +
      l("ext", padExtension) +
      "|" +
      l("timestamp", padTimestamp) +
      "|" +
      l("title", padTitle)
  );
  console.info(
    "-".repeat(padFilename + padExtension + padTimestamp + padTitle + 4)
  );

  return handleAllFiles(
    globalOptions,
    (file: File, options: OptionsHandleOneFile) => {
      if (options.errorOnly) {
        // Display only problems
        return true;
      }

      const sep = "|";
      const msg =
        "" +
        r(
          path.relative(process.cwd(), file.i_f_path_full.initial),
          padFilename
        ) +
        sep +
        r(file.type, padType) +
        sep +
        l(file.i_f_extension.initial, padExtension) +
        sep +
        (file instanceof FileExif && file.i_fe_time
          ? l(file.i_f_time.initial.to2x3StringForHuman(), padTimestamp)
          : IconFailure +
            " " +
            chalk.red(
              l(file.i_f_time.initial.to2x3StringForHuman(), padTimestamp - 2)
            )) +
        sep +
        (file instanceof FileExif && file.i_fe_title
          ? l(file.i_fe_title.initial, padTitle)
          : IconFailure +
            " " +
            chalk.red(l(file.i_f_title.initial, padTitle - 2)));
      writeLine(IconSuccess + " " + msg);

      return true;
    }
  );
}
