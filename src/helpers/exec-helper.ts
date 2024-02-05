import debug from "debug";
import {
  CommonExecOptions,
  ExecFileException,
  execFileSync
} from "node:child_process";

export type ExecFileSyncException = ExecFileException & {
  stdout: string;
  stderr: string;
  status: number;
};

const LOCALE = "C.UTF-8";

process.env = {
  ...process.env,
  LANGUAGE: LOCALE,
  LANG: LOCALE,
  LC_ALL: LOCALE,
  LC_CTYPE: LOCALE
};

const debugExec = debug("exec");

export function myExecFileSync(
  file: string,
  args: string[],
  options?: {
    hideError?: boolean;
    execOptions?: CommonExecOptions;
  }
): string {
  try {
    debugExec(`${file} command`, args);
    const stdout = execFileSync(file, args, {
      encoding: "utf-8",
      ...options?.execOptions
    });
    debugExec(`${file} result: `, stdout);
    return (stdout as string) ?? "";
  } catch (error) {
    const e = {
      stdout: "",
      stderr: "",
      status: 0, // Force to be a number
      signal: null,
      ...(error as ExecFileException)
    };
    debugExec(`${file} error:`, e.status);
    if (!options?.hideError) {
      process.stderr.write("\n");
      process.stderr.write("runExif output: " + e.status);
      process.stderr.write("\n");
      process.stderr.write(e.stdout);
      process.stderr.write("\n");
      process.stderr.write(e.stderr);
      process.stderr.write("\n");
    }
    if (e.signal) {
      process.stderr.write("\n\n\n Exiting due to signal");
      process.stderr.write("Signal: " + e.signal);
      process.exit(1);
    }
    throw error as ExecFileException;
  }
}
