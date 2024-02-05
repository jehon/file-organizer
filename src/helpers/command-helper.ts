// https://nodejs.org/dist/latest-v16.x/docs/api/readline.html
import "node:tty";
import PQueue from "p-queue"; // https://www.npmjs.com/package/p-queue
import File from "../file-types/file";
import buildFile, { buildFileAs } from "../lib/buildFile";
import { Flavor } from "../lib/value";
import { fsFolderListingRecursively, fsIsFolder } from "./fs-helpers";
import {
  IconFailure,
  IconSuccess,
  displayStats,
  setStatus,
  stats
} from "./tui-helpers";

export const fileOptions = {
  type: "string",
  coerce: (val: string) => val + ""
};

export type OptionsHandleOneFile = {
  progress: boolean;
  loadOnly: (filepath: string) => boolean; // If loadOnly, the file is treated as a File, not loading other data...
  errorOnly?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
};

async function handleOneFile(
  filename: string,
  handler: (
    file: File,
    options: OptionsHandleOneFile
  ) => Promise<boolean> | boolean,
  options: OptionsHandleOneFile
): Promise<boolean> {
  if (options.progress) {
    displayStats();
  }

  //
  // !! buildFileAs does not handle Folders very well
  //
  const f = fsIsFolder(filename)
    ? buildFile(filename)
    : options.loadOnly && options.loadOnly(filename)
      ? buildFileAs(filename, File)
      : buildFile(filename);

  stats.loaded++;
  if (options.progress) {
    displayStats();
  }

  let res = true;
  if (!f.isTop()) {
    await f.getParentValue()[Flavor.current].runAllFixes();
    await f.getParentValue()[Flavor.expected].runAllFixes();

    res = await handler(f, options);
    if (!res) {
      stats.problems++;
    }
  }

  stats.done++;
  if (options.progress) {
    displayStats();
  }

  return res;
}

export type OptionsHandleAllFiles = OptionsHandleOneFile & {
  files: string[];
  filter: (fn: string) => boolean;
  concurrency: number;
};

export function handleAllFiles(
  globalOptions: OptionsHandleAllFiles,
  handler: (
    file: File,
    options: OptionsHandleOneFile
  ) => Promise<boolean> | boolean
) {
  if (globalOptions.dryRun) {
    console.info("Using dry run mode");
  }

  const queue = new PQueue({ concurrency: globalOptions.concurrency });

  if (!globalOptions.filter) {
    globalOptions.filter = () => true;
  }

  // Get all files recursively
  const allFilenames = globalOptions.files
    .map((f) => fsFolderListingRecursively(f))
    .flat(1)
    .filter(globalOptions.filter);

  stats.files = allFilenames.length;

  return (
    queue
      // Add all as one to handle the .then()
      .addAll(
        allFilenames.map(
          // We need to receive functions... that the queue will execute after
          (filename) => () => handleOneFile(filename, handler, globalOptions)
        )
      )
      // When all is resolved
      .then((results) => {
        const problems = results.reduce((acc, v) => acc + (v ? 0 : 1), 0);
        if (problems == 0) {
          if (globalOptions.progress) {
            setStatus();
            process.stdout.write(`${IconSuccess} Done with success\n`);
          }
        } else {
          if (globalOptions.progress) {
            setStatus();
            process.stderr.write(
              `${IconFailure} Done with ${problems} problems\n`
            );
          }
        }
      })
  );
}
