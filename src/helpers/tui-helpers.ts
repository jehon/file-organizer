import chalk from "chalk";
import Readline from "node:readline";
import { secs2Time } from "./time-helpers";

function cleanLine(): void {
  Readline.clearLine(process.stdout, 0);
  Readline.cursorTo(process.stdout, 0);
}

export function writeLine(line: string): void {
  cleanLine();
  process.stdout.write(line + "  ");
  process.stdout.write("\n");
  process.stdout.write(statusBar);
}

export function setStatus(status: string = ""): void {
  if (statusBar) {
    // Remove previous status
    cleanLine();
  }
  statusBar = status;
  if (statusBar) {
    // Print new status
    process.stdout.write(statusBar);
    Readline.cursorTo(process.stdout, 0);
  }
}

let statusBar: string = "";

export const stats = {
  startTime: new Date().getTime(),
  files: 0,
  loaded: 0,
  done: 0,
  problems: 0
};

export function displayStats(dryRun: boolean = false): void {
  const remain = (e: number, s: string) => (e > 0 ? `${e} ${s} ` : "");

  const ttyWidth = process.stdout.columns ?? 80;

  const width = Math.min(ttyWidth - 50, 60);
  const b1 = Math.round(Math.max(0, (stats.done / stats.files) * width));
  const b2 = Math.round(Math.max(0, (stats.loaded / stats.files) * width - b1));
  const b3 = Math.max(0, width - b2 - b1);
  const remainingSeconds = Math.round(
    ((new Date().getTime() - stats.startTime) / stats.done) *
      (stats.files - stats.done)
  );
  const eta = isFinite(remainingSeconds)
    ? secs2Time(remainingSeconds / 1000)
    : "NA";

  const status = `${"█".repeat(b1)}${"▒".repeat(b2)}${"‧".repeat(
    b3
  )} ETA: ${eta} | ${stats.files} files ${remain(
    stats.files - stats.loaded,
    "loading"
  )} ${dryRun ? "-dry-run-" : remain(stats.files - stats.done, "fixing")}`;
  setStatus(status);
}

export const IconSuccess = chalk.green("✓");
export const IconFailure = chalk.red.bold("✘");
export const IconSkipped = chalk.magenta("⚐");
