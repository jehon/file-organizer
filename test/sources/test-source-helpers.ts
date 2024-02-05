import assert from "node:assert";
import fs from "node:fs";
import { beforeEach } from "node:test";
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

function createFileFromDataSources(
  subPath: string, // Relative to data path
  inFolderWithinTmp: string = ""
): string {
  return createFileFromTo(
    tempSourcePath(inFolderWithinTmp),
    rootPath("test", "sources", "data", subPath)
  );
}

function getANewFile(filepath: string) {
  getParentOf(filepath).reset();
  return buildFile(filepath);
}

function testData(file: File, data: Record<Flavor, Record<string, string>>) {
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

async function testValueChange<U>(filepath: string, v: keyof File, nv: U) {
  const file = getANewFile(filepath);
  file.getValueByKey(v).expect(nv);
  await file.runAllFixes();
  file.assertIsFixed();
  assert.equal(file.getValueByKey(v).current, nv);

  const nfile = getANewFile(file.currentFilepath);
  nfile.assertIsFixed();
  if (nfile.getValueByKey(v).initial instanceof GenericTime) {
    assertIsEqual(
      nfile.getValueByKey(v).initial as GenericTime,
      nv as GenericTime
    );
  } else {
    assert.equal(nfile.getValueByKey(v).initial, nv);
  }
}

export default async function fromTestSuite(
  t: TestContext,
  filename: string,
  options: {
    [Flavor.initial]?: Record<string, string>;
    [Flavor.current]?: Record<string, string>;
    [Flavor.expected]?: Record<string, string>;
    mtime?: string;
    type?: typeof File;
    build?: {
      inFolderWithinTmp?: string;
    };
  }
) {
  const inFolderWithinTmp = options.build?.inFolderWithinTmp;

  await t.test(filename, async (t: TestContext) => {
    let filepath: string;
    let file: File;

    /*
     * Helpers
     */
    /*
     * Tests
     */
    beforeEach(() => {
      filepath = createFileFromDataSources(filename, inFolderWithinTmp);
      if (options.mtime) {
        fs.utimesSync(
          filepath,
          new Date(options.mtime),
          new Date(options.mtime)
        );
      }
    });

    await t.test("should load the file", () => {
      file = getANewFile(filepath);
      assert.ok(file instanceof File);
      if ("type" in options) {
        assert.ok(
          file instanceof options.type!,
          `It should be a ${options.type!.name} but it is a ${
            file.constructor.name
          } `
        );
      }
      testData(file, {
        [Flavor.initial]: options[Flavor.initial] ?? {},
        [Flavor.current]: options[Flavor.current] ?? {},
        [Flavor.expected]: options[Flavor.expected] ?? {}
      });
    });

    await t.test("should fix", async () => {
      file = getANewFile(filepath);
      await file.runAllFixes();
      file.assertIsFixed();

      getParentOf(file.currentFilepath).reset();
      const nfile = buildFile(file.currentFilepath);
      nfile.assertIsFixed();
      testData(nfile, {
        [Flavor.initial]: {},
        [Flavor.current]: options[Flavor.expected] ?? {},
        [Flavor.expected]: {}
      });
    });

    await t.test("should set a title", async () => {
      await testValueChange<string>(filepath, "i_f_title", "Test title");
    });

    await t.test("should set a time", async () => {
      await testValueChange<GenericTime>(
        filepath,
        "i_f_time",
        GenericTime.from2x3String("2020-01-02 03-04-05")
      );
    });
  });
}
