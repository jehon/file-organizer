import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import File from "../../src/file-types/file";
import { getParentOf } from "../../src/file-types/file-folder";
import buildFile from "../../src/lib/buildFile";
import { GenericTime } from "../../src/lib/generic-time";
import { Flavor } from "../../src/lib/value";
import {
  assertIsEqual,
  createFileFromTo,
  rootPath,
  tempPathCommon
} from "../test-common-helpers";

export { filenameIsA } from "../test-common-helpers";
export const TestDefaultTitle = "Sources";

//
// These scripts are used to test import from various hardware / software
//
// Use http://www.time.is to generate images
//

const tempSourcePath = (...args: string[]) =>
  tempPathCommon("sources", ...args);

function createFilepathFromDataSources(
  subPath: string, // Relative to data path
  mtime?: string
): string {
  // We need to be in a folder named "source"
  // but different for each test
  const np = path.parse(subPath).name;
  const filepath = createFileFromTo(
    tempSourcePath(np, TestDefaultTitle.toLowerCase()),
    rootPath("test", "sources", "data", subPath)
  );
  getParentOf(tempSourcePath())._addNewlyCreateFile(np);
  getParentOf(tempSourcePath(np)).reset();
  if (mtime) {
    fs.utimesSync(filepath, new Date(mtime), new Date(mtime));
  }
  return filepath;
}

function getANewFileObject(filepath: string) {
  getParentOf(filepath).reset();
  return buildFile(filepath);
}

function testFileObjectHasData(
  file: File,
  data: Record<Flavor, Record<string, string>>
) {
  for (const flavor of [Flavor.initial, Flavor.current, Flavor.expected]) {
    for (const k of Object.keys(data[flavor])) {
      assert.ok(k in file, `File should contain ${k}`);
      assertIsEqual(
        file.getValueByKey(k)[flavor],
        data[flavor][k],
        `Expect ${flavor} ${k}`
      );
    }
  }
}

export default async function fromTestSuite(
  t: TestContext,
  filename: string,
  data: {
    [Flavor.initial]: Record<string, string>;
    [Flavor.current]: Record<string, string>;
    [Flavor.expected]: Record<string, string>;
  },
  options: {
    type: typeof File;
    mtime?: string;
  }
) {
  await t.test(filename, async (t: TestContext) => {
    await t.test("should load the file", () => {
      const filepath = createFilepathFromDataSources(filename, options.mtime);
      const file = getANewFileObject(filepath);
      assert.ok(file instanceof File);
      assert.ok(
        file instanceof options.type,
        `It should be a ${options.type.name} but it is a ${file.constructor.name} `
      );
      testFileObjectHasData(file, data);
    });

    await t.test("should fix", async () => {
      const filepath = createFilepathFromDataSources(filename, options.mtime);
      const file = getANewFileObject(filepath);
      await file.runAllFixes();
      file.assertIsFixed();

      getParentOf(file.currentFilepath).reset();
      const nfile = buildFile(file.currentFilepath);
      nfile.assertIsFixed();
      testFileObjectHasData(nfile, {
        [Flavor.initial]: {},
        [Flavor.current]: data[Flavor.expected],
        [Flavor.expected]: {}
      });
    });

    await t.test("should set a title", async () => {
      const filepath = createFilepathFromDataSources(filename, options.mtime);
      const file = getANewFileObject(filepath);

      const newValue = "Test title";
      file.i_f_title.expect(newValue);
      await file.runAllFixes();
      file.assertIsFixed();
      assertIsEqual(file.i_f_title.current, newValue);

      const nfile = getANewFileObject(file.currentFilepath);
      nfile.assertIsFixed();
      assertIsEqual(nfile.i_f_title.initial, newValue);
    });

    await t.test("should set a time", async () => {
      const filepath = createFilepathFromDataSources(filename, options.mtime);
      const file = getANewFileObject(filepath);

      const newValue = GenericTime.from2x3String("2020-01-02 03-04-05");
      file.i_f_time.expect(newValue);
      await file.runAllFixes();
      file.assertIsFixed();
      assertIsEqual(file.i_f_time.current, newValue);

      const nfile = getANewFileObject(file.currentFilepath);
      nfile.assertIsFixed();
      assertIsEqual(nfile.i_f_time.initial, newValue);
    });
  });
}
