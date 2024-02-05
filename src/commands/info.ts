import File from "../file-types/file";
import {
  OptionsHandleAllFiles,
  handleAllFiles
} from "../helpers/command-helper";
import { Equalable } from "../lib/equalable";
import Value from "../lib/value";

export const command = "info [files...]";

export const describe = "Get some info about the file";

export const builder = {
  key: {
    alias: ["k"],
    default: ""
  }
};

export const handler = function (
  globalOptions: OptionsHandleAllFiles & { key?: string }
) {
  globalOptions.verbose = false;
  globalOptions.progress = false;

  const key = globalOptions.key;

  return handleAllFiles(globalOptions, (f: File) => {
    if (key) {
      const opt = f.getValueByKey(key);
      if (opt) {
        let str: string = "";
        switch (true) {
          case typeof opt.initial == "string":
            // JSON.stringify of a string add "" around
            str = opt.initial;
            break;
          case opt.initial instanceof Equalable:
            str = opt.initial.toString();
            break;
          default:
            str = JSON.stringify(opt.initial);
        }
        process.stdout.write(str + "\n");
      } else {
        process.stdout.write("\n");
      }
    } else {
      const res: Record<string, string> = {};
      res.initialFilepath = f.i_f_filename.initial;
      res.currentFilepath = f.i_f_filename.current;
      res.expectedFilepath = f.i_f_filename.expected;
      for (const [k, v] of f.getAllValues()) {
        if (!(v instanceof Value)) {
          continue;
        }
        if (v.current instanceof Object && "id" in v.current) {
          continue;
        }

        res[k] = (v.current as string | number) + "";

        if (v.isModified()) {
          res[k] += " (" + v.initial + ")";
        }

        if (!f.getValueByKey(k).isDone()) {
          res[k] += " -> " + v.expected;
        }
      }

      process.stdout.write(JSON.stringify(res, null, 2) + "\n");
    }

    return true;
  });
};
