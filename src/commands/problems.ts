import File from "../file-types/file";
import {
  OptionsHandleAllFiles,
  handleAllFiles
} from "../helpers/command-helper";

export const command = "problems [files...]";

export const describe = "Get the problems";

export const builder = {};

export const handler = function (globalOptions: OptionsHandleAllFiles) {
  return handleAllFiles(globalOptions, (f: File) => {
    f.printDetails();
    return f.isFixed();
  });
};
