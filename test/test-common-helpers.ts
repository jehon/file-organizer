import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { isEqual } from "../src/lib/equalable";
import { parseFilename } from "../src/lib/timestamp";

export function iFilename(meta: ImportMeta): string {
  return meta.filename.split("/").pop()!;
}

export const fromCWD = (...args: string[]) => path.join(process.cwd(), ...args);
export const rootPath = (...args: string[]) =>
  path.join(path.dirname(import.meta.dirname), ...args);

export const tempPathCommon = (...args: string[]) => rootPath("tmp", ...args);

export function filenameIsA(
  originalString: string,
  type: string,
  time: string = originalString,
  extra: { title?: string; qualif?: string } = {}
) {
  const parsed = parseFilename(originalString);
  assert.equal(
    parsed.type,
    type,
    `${originalString}: Interpreted wrongly as ${parsed.type} instead of ${type}`
  );

  assert.equal(
    parsed.time.to2x3StringForHuman(),
    time,
    `${originalString}: Not correctly interpreted TS: ${parsed.time.toString()} instead of ${time.toString()}`
  );

  for (const k of Object.keys(extra)) {
    const current = parsed[k as keyof typeof parsed];
    const expected = extra[k as keyof typeof extra];
    assert.equal(
      current,
      expected,
      `${originalString}: Key [${k}] incorrect: ${JSON.stringify(current)} instead of ${JSON.stringify(expected)}`
    );
  }
}

/**
 * Create a new file and returns its path
 * The file is a copy of the original one
 */
export function createFileFromTo(destPath: string, fullSource: string): string {
  const newName = path.parse(fullSource).base;
  // const where = path.join(tempPath(opts?.inFolder ?? "" + testId++));
  const target = path.join(destPath, newName);

  fs.mkdirSync(destPath, { recursive: true });
  // Experimental: https://nodejs.org/api/fs.html#fscpsyncsrc-dest-options
  fs.cpSync(fullSource, target, { preserveTimestamps: true });

  return target;
}

export function assertIsEqual(a: unknown, b: unknown, msg?: string) {
  assert.ok(
    isEqual(a, b),
    `Expected that ${JSON.stringify(a)} == ${JSON.stringify(b)}` +
      (msg ? ` (${msg})` : "")
  );
}
