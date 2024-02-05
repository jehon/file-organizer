import FileExif from "../file-types/file-exif";
import {
  OptionsHandleAllFiles,
  handleAllFiles
} from "../helpers/command-helper";

export const command = ["migrate [files..]"];

export const describe = "Migrate informations";

export const builder = {};

/**
 * @param {object} options the current options
 * @returns {Promise} when finished
 */
export function handler(options: OptionsHandleAllFiles) {
  return handleAllFiles(options, async (f, options) => {
    if (f instanceof FileExif) {
      //
      // In fact, we really set the title / timestamp only
      // on Exif files
      //
      // On non exif files (ex: .txt, .pdf, ...), we don't change that
      // from here
      //

      // We only fix title
      f.revertAll();

      const legacy = f.rawExifData["UserComment"];

      if (!f.i_fe_title.initial && legacy) {
        // We only fix title
        f.i_fe_title.expect(legacy);

        if (!options.dryRun) {
          f.i_fe_clean_tags.expected.push("UserComment");
          await f.i_fe_synced.runFixValue();
        }

        f.printDetails({
          includesActions: true,
          excludes: ["i_fe_synced", "i_reservation", "i_ft_has_title"]
        });
      }
    }

    return true;
  });
}
