import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as cmdDump from "./commands/dump";
import * as cmdImport from "./commands/import";
import * as cmdInfo from "./commands/info";
import * as cmdMigrate from "./commands/migrate";
import * as cmdNormalize from "./commands/normalize";
import * as cmdOthers from "./commands/others";
import * as cmdProblems from "./commands/problems";
import * as cmdTitles from "./commands/titles";

type FOCommand = {
  command: string | string[];
  describe: string;
  builder: Record<string, Record<string, unknown>>;
  handler: (parameters: unknown) => Promise<void>;
};

await yargs(hideBin(process.argv))
  .options({
    dryRun: {
      alias: ["dry-run", "n"],
      type: "boolean",
      default: false
    },
    concurrency: {
      type: "number",
      default: 5
    },
    debug: {
      alias: ["d"],
      type: "boolean",
      default: false
    },
    verbose: {
      alias: ["v"],
      type: "boolean",
      default: false
    },
    progress: {
      type: "boolean",
      default: true
    },
    files: {
      type: "array",
      // Always have a folder
      default: ["."],
      // PS: transformation is done later, since it requires "-root"
      // coerce: (val: any) => (val.length == 0 ? ["."] : val)
      coerce: (list: []) => list.map((val: string | number) => "" + val)
    }
  })
  .recommendCommands()
  .strict()
  .help()
  .alias("help", "h")
  .command(cmdDump as FOCommand)
  .command(cmdImport as FOCommand)
  .command(cmdInfo as FOCommand)
  .command(cmdMigrate as FOCommand)
  .command(cmdNormalize as FOCommand)
  .command(cmdOthers as FOCommand)
  .command(cmdProblems as FOCommand)
  .command(cmdTitles as FOCommand)
  .fail((msg, err) => {
    //yargs.js.org/docs/#fail
    if (err) {
      throw err;
    }

    console.error(msg);
    process.exit(1);
  }).argv;
