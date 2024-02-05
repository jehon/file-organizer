import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getParentOf } from "../../src/file-types/file-folder";
import FileMovie from "../../src/file-types/file-movie";
import { buildFileAs } from "../../src/lib/buildFile";
import { GenericTime } from "../../src/lib/generic-time";
import {
  assertIsEqual,
  createFileFromDataUnit,
  iFilename
} from "./test-unit-helpers";

async function testFullFlow(
  baseFilename: string,
  its_exiftime: string,
  its_title: string
) {
  await test("should read data", async () => {
    const tpath = path.join(
      iFilename(import.meta),
      path.basename(baseFilename),
      "read"
    );
    let filename = createFileFromDataUnit(baseFilename, tpath);

    try {
      const f = buildFileAs(filename, FileMovie);

      assert.equal(f.i_fe_time.initial, its_exiftime, baseFilename);

      assert.equal(f.i_fe_title.initial, its_title, baseFilename);

      filename = f.currentFilepath;
    } finally {
      await fs.promises.unlink(filename);
    }
  });

  await test("should write data", async () => {
    const tpath = path.join(
      iFilename(import.meta),
      path.basename(baseFilename),
      "write"
    );
    let filename = createFileFromDataUnit(baseFilename, tpath);
    {
      const f = buildFileAs(filename, FileMovie);

      const esc = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

      // Set some values
      f.i_f_title.expect("new title");
      f.i_f_time.expect(GenericTime.from2x3String("2020-01-02 02-03-04"));

      await f.runAllFixes();
      filename = f.currentFilepath;

      assert.match(
        f.currentFilepath,
        new RegExp(
          "^" +
            esc(
              path.join(
                path.dirname(filename),
                "2020-01-02 02-03-04 New title ["
              )
            )
        ),
        baseFilename
      );
    }

    {
      // Create a new file, and see if it is ok
      getParentOf(filename).reset();
      const f = buildFileAs(filename, FileMovie);

      assert.equal(f.i_f_title.initial, "New title", baseFilename);

      // Could not test exif, because it has some timezone problems
      assertIsEqual(f.i_f_time.initial, "2020-01-02 02-03-04", baseFilename);
    }
  });
}

// Canon MOV
await testFullFlow("DSC_2506.MOV", "2019:09:19 07:48:25", "");

// Android MP4
await testFullFlow(
  "2019-09-03 12-48/20190903_124726.mp4",
  "2019:09:03 10:47:31",
  ""
);
