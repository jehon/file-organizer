import File from "../file-types/file";
import { FileFallback } from "../file-types/file-fallback";
import {
  OptionsHandleAllFiles,
  handleAllFiles
} from "../helpers/command-helper";
import { writeLine } from "../helpers/tui-helpers";

export const command = "others [files..]";

export const describe = "Get some info about the files";

export const builder = {};

const extensionsMap: Record<string, number> = {};

/**
 * @param {object} globalOptions the current options
 * @returns {Promise<void>} when finished!
 */
export function handler(globalOptions: OptionsHandleAllFiles) {
  return handleAllFiles(globalOptions, (f: File) => {
    if (!(f instanceof FileFallback)) {
      return true;
    }

    writeLine(f.currentFilepath);

    const ext = f.i_f_extension.current;
    if (!(ext in extensionsMap)) {
      extensionsMap[ext] = 0;
    }
    extensionsMap[ext]++;

    return true;
  }).then(() => {
    process.stdout.write(JSON.stringify(extensionsMap, null, 2));
  });
}
