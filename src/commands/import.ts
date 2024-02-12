import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import File from "../file-types/file";
import { getFolderByName } from "../file-types/file-folder";
import FileTimed from "../file-types/file-timed";
import {
  OptionsHandleAllFiles,
  OptionsHandleOneFile,
  fileOptions,
  handleAllFiles
} from "../helpers/command-helper";
import { writeLine } from "../helpers/tui-helpers";
import { buildFileAs } from "../lib/buildFile";
import { GenericTime } from "../lib/generic-time";
import { final } from "../lib/timestamp";

export const command = ["import [files...]"];

export const describe = "Import the folder and timestamp the files";

export const builder = {
  to: {
    describe: "Where to store the files",
    demandOption: true,
    ...fileOptions
  }
};

export function handler(
  globalOptions: OptionsHandleAllFiles & { from: string; to: string }
) {
  const legacyFoldername = path.join(globalOptions.to, "legacy");
  // Create before instantiating the targetFolder!
  fs.mkdirSync(legacyFoldername, { recursive: true });
  const targetFolder = getFolderByName(globalOptions.to);
  const targetFolderLegacy = getFolderByName(
    path.join(globalOptions.to, "legacy")
  );

  const olderFile = targetFolder
    .listContentAsStrings()
    .filter((v) => path.parse(v).name.match(final))[0];

  const minimalTS: GenericTime = olderFile
    ? buildFileAs(
        path.join(targetFolder.i_f_path_full.current, olderFile),
        File
      ).i_f_time.initial
    : GenericTime.empty();

  writeLine(`Minimal TS: ${minimalTS.to2x3StringForHuman()}`);

  return handleAllFiles(
    globalOptions,
    async (f: File, options: OptionsHandleOneFile) => {
      if (f.i_f_is_folder.current) {
        // Skip folders
        return true;
      }

      if (f instanceof FileTimed) {
        f.i_f_title.revert();

        if (f.i_f_time.expected.isEmpty()) {
          f.i_f_time.expect(f.getMTime());
          f.i_f_qualif.expect("ts-guessed");
        }
      }

      if (f.i_f_time.expected.isAfter(minimalTS)) {
        // Move the file to the import folder
        f.getParentValue().expect(targetFolder, "Import: move to folder");
      } else {
        // Legacy
        f.getParentValue().expect(targetFolderLegacy, "Import: move to legacy");
      }

      if (f.isFixed()) {
        return true;
      }

      if (!options.dryRun) {
        await f.i_f_path_full.runFixValue();
      }

      writeLine(
        chalk.blue(f.i_f_filename.initial).padEnd(40) +
          " -> " +
          chalk.yellow(
            path.relative(
              targetFolder.currentFilepath,
              f.i_f_path_full.expected
            )
          ) +
          " " +
          chalk.green("v")
      );

      return true;
    }
  );
}
