import fs from "fs";
import os from "os";
import path from "path";
import File from "../file-types/file";
import FileExif from "../file-types/file-exif";
import {
  OptionsHandleAllFiles,
  handleAllFiles
} from "../helpers/command-helper";

export const JSONFile = path.join(os.homedir(), "titles.json");

export const command = "titles [files...]";

export const describe = "Get some info about the file";

export const builder = {
  from: {
    type: "string",
    default: "",
    describe: "old title to be remplaced"
  },
  to: {
    type: "string",
    default: "",
    describe: "new value for the title"
  },
  json: {
    type: "boolean",
    default: false,
    describe: "If specified, load the json file"
  }
};

type TitleStat = {
  count: number;
};

/**
 * Load the mappings from the json file
 *
 * @return {object} with the mappings
 */
function loadMappings(): Record<string, string> {
  return JSON.parse(fs.readFileSync(JSONFile).toString()) as Record<
    string,
    string
  >;
}

export function handler(
  globalOptions: OptionsHandleAllFiles & {
    from: string;
    to: string;
    json: boolean;
  }
) {
  const titlesList: Record<string, TitleStat> = {};
  // Changes in titles: key/from -> value/to
  const titlesTransformations = new Map<string, string>();
  if (globalOptions.json) {
    process.stdout.write("Loading json mappings\n");
    for (const [key, value] of Object.entries(loadMappings())) {
      if (value) {
        process.stdout.write(` - ${key} -> ${value}\n`);
        titlesTransformations.set(key, value);
      }
    }
  }

  if (globalOptions.from) {
    globalOptions.loadOnly = (filepath) =>
      !path.parse(filepath).name.includes(globalOptions.from);
  }

  if (globalOptions.from && globalOptions.to) {
    titlesTransformations.set(globalOptions.from, globalOptions.to);
  }

  return handleAllFiles(globalOptions, async (file: File) => {
    for (const [from, to] of titlesTransformations.entries()) {
      if (from && from == file.i_f_title.current) {
        if (to) {
          file.i_f_title.expect(to);
          await file.i_f_path_full.runFixValue();
          if (file instanceof FileExif) {
            await file.i_fe_synced.runFixValue();
          }
        }
        process.stdout.write(file.i_f_path_full.current + "\n");
      }
    }

    const t = file.i_f_title.current;
    if (!titlesList[t]) {
      titlesList[t] = {
        count: 0
      };
    }
    titlesList[t].count++;

    return true;
  }).then(() => {
    const newMappings = new Map();
    const ordered: Record<string, TitleStat> = Object.keys(titlesList)
      .sort()
      .reduce((obj: Record<string, TitleStat>, title: string) => {
        obj[title] = titlesList[title];
        return obj;
      }, {});

    for (const title of Object.keys(ordered)) {
      if (title && !newMappings.has(title)) {
        // To be configured for next run
        newMappings.set(title, "");
      }
      const v: TitleStat = ordered[title];
      process.stdout.write(`  - ${title}: ${v.count}\n`);
    }
    fs.writeFileSync(
      JSONFile,
      JSON.stringify(Object.fromEntries(newMappings.entries()), null, 2)
    );
  });
}
