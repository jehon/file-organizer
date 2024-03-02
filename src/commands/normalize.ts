import { distance as levenshtein } from "fastest-levenshtein";
import FileExif from "../file-types/file-exif";
import {
  OptionsHandleAllFiles,
  handleAllFiles
} from "../helpers/command-helper";
import { AUTO_TITLES } from "../lib/constants";
import { GenericTime } from "../lib/generic-time";

export const command = ["$0 [files..]", "normalize [files..]"];

export const describe = "Normalize based on present information";

export const builder = {
  title: {
    alias: ["t"],
    type: "string",
    default: "",
    describe: "Force the title to all"
  },
  timestamp: {
    alias: ["ts"],
    type: "string",
    default: "",
    describe: "Force the timestamp to all"
  },
  titleFromFilename: {
    alias: ["title-from-filename", "tfn"],
    type: "boolean",
    default: false,
    describe: "Force title from filename"
  },
  titleFromFolder: {
    alias: ["title-from-folder", "tff"],
    type: "boolean",
    default: false,
    describe: "Force title from folder"
  },
  timestampFromFilename: {
    alias: ["timestamp-from-filename", "tsfn"],
    type: "boolean",
    default: false,
    describe: "Force timestamp to filename timestamp"
  },
  brokenOnly: {
    alias: ["broken-only", "x"],
    type: "boolean",
    default: false,
    describe: "Modify broken only"
  }
};

export function handler(
  globalOptions: OptionsHandleAllFiles & {
    title: string;
    timestamp: string;
    titleFromFolder: boolean;
    titleFromFilename: boolean;
    timestampFromFilename: boolean;
    brokenOnly: boolean;
  }
) {
  return handleAllFiles(globalOptions, async (f, options) => {
    /**********************************
     * Adapt to options !
     *
     * Caution: not all fields are present on all object !
     *
     *
     * !! Values are also set in the file-timed !!
     */

    if (!f.isFixed() || !globalOptions.brokenOnly) {
      //  isFixed &&  brokenOnly -> no  = modify only the not-fixed
      // !isFixed &&  brokenOnly -> yes = modify the not-fixed
      //  isFixed && !brokenOnly -> yes = modify all
      // !isFixed && !brokenOnly -> yes = modify all

      if (f instanceof FileExif) {
        //
        // In fact, we really set the title / timestamp only
        // on Exif files
        //
        // On non exif files (ex: .txt, .pdf, ...), we don't change that
        // from here
        //

        /**********************************************
         *  Titles
         */

        // Remove some generic titles misplaced
        // Note: All files has a parent since isTop is excluded by handleOneFile in command-helper
        if (AUTO_TITLES.includes(f.i_f_title.expected.toLowerCase())) {
          f.i_f_title.expect(
            f.getParentValue().expected.i_f_title.current,
            "Normalize: Taking the title from the parent folder"
          );
        }

        const dist = levenshtein(
          f.i_f_title.expected,
          f.getParentValue().expected.i_f_title.current
        );

        // We should say: dist/2 < f.i_f_title.expected.length/2 => less than half is changed
        if (dist > 0 && dist < 4 && dist < f.i_f_title.expected.length) {
          f.i_f_title.expect(
            f.getParentValue().expected.i_f_title.current,
            `Fix typo based from parent (${dist})`
          );
        }

        // Handle option
        if (globalOptions.title) {
          f.i_f_title.expect(globalOptions.title, "options (title)");
        }

        // Handle option
        if (globalOptions.timestamp) {
          f.i_f_time.expect(
            GenericTime.from2x3String(globalOptions.timestamp),
            "options (ts)"
          );
        }

        // Handle option
        if (globalOptions.titleFromFolder) {
          // We take the initial value, which is the one at startup time
          f.i_f_title.expect(
            f.getParentValue().expected.i_f_title.initial,
            "option (tff)"
          );
        }

        // Handle option
        if (globalOptions.titleFromFilename) {
          // We take the initial value, which is the one at startup time
          f.i_f_title.expect(f.i_f_title.initial, "option (tfn)");
        }

        // Fallback
        if (!f.i_f_title.expected) {
          // We take the title from the parent
          f.i_f_title.expect(
            f.getParentValue().expected.i_f_title.initial,
            "fallback to parent"
          );
          if (!f.i_f_title.expected) {
            // We take the initial value, which is the one at startup time
            f.i_f_title.expect(f.i_f_title.initial, "fallback to initial");
          }
        }

        /**********************************************
         *  Timestamps
         */

        // Handle option
        if (globalOptions.timestampFromFilename) {
          // We take the initial value, which is the one at startup time
          f.i_f_time.expect(
            f.i_f_time.initial,
            "Normalize: from options.timestampFromFilename"
          );
        }
      }
    }

    if (!options.dryRun) {
      await f.runAllFixes();
    }

    f.printDetails({
      includesActions: true,
      includesInfos: options.verbose,
      includesCalculated: options.verbose,
      includes: options.verbose ? ["i_fe_title", "i_fe_time"] : [],
      excludes: options.verbose ? [] : ["i_fe_synced", "i_reservation"]
    });

    return options.dryRun || f.isFixed();
  });
}
