import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { EXIF_EMPTY } from "../../src/file-types/file-exif";
import { getParentOf } from "../../src/file-types/file-folder";
import FilePicture from "../../src/file-types/file-picture";
import { buildFileAs } from "../../src/lib/buildFile";
import { GenericTime } from "../../src/lib/generic-time";
import {
  assertIsEqual,
  createFileFromDataUnit,
  dataPathUnit,
  iFilename,
  tempPathUnit
} from "./test-unit-helpers";

const testName = iFilename(import.meta);

async function testFullFlow(
  baseFilename: string,
  its_exiftime: string,
  its_title: string,
  its_rotation: number = 0
) {
  await test(`with ${baseFilename}`, async function (t) {
    await t.test("should read data", async function () {
      const tpath = path.join(testName, path.basename(baseFilename), "read");
      let filename = createFileFromDataUnit(baseFilename, tpath);

      try {
        const f = buildFileAs(filename, FilePicture);
        assert.equal(
          f.i_fe_time.initial,
          its_exiftime,
          baseFilename + " (i_fe_time)"
        );

        assert.equal(
          f.i_fe_title.initial,
          its_title,
          baseFilename + " (i_fe_title)"
        );

        assert.equal(
          f.i_fe_orientation.initial,
          its_rotation,
          baseFilename + " (i_fe_orientation)"
        );

        filename = f.currentFilepath;
      } finally {
        await fs.promises.unlink(filename);
      }
    });

    await t.test("should write data", async function () {
      const tpath = path.join(testName, path.basename(baseFilename), "write");
      let filename = createFileFromDataUnit(baseFilename, tpath);
      {
        const f = buildFileAs(filename, FilePicture);

        // In the loading phase, parent could change
        // but we don't want this in this phase
        f.getParentValue().revert();
        f.getParentValue().current.revertAll();

        const esc = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

        // Set some values
        f.i_f_title.expect("new title");
        f.i_f_time.expect(GenericTime.from2x3String("2020-01-02 02-03-04"));

        await f.runAllFixes();
        filename = f.currentFilepath;
        assert.match(
          f.currentFilepath,
          new RegExp(
            "^" + esc(tempPathUnit(tpath, "2020-01-02 02-03-04 New title"))
          ),
          baseFilename
        );
      }

      {
        // Create a new file, and see if it is ok
        getParentOf(filename).reset();
        const f = buildFileAs(filename, FilePicture);

        filename = f.currentFilepath;
        assert.equal(f.i_f_title.initial, "New title");
        assertIsEqual(f.i_f_time.initial, "2020-01-02 02-03-04");
        assert.equal(f.i_fe_orientation.initial, 0);
      }
    });
  });
}

await testFullFlow("no_exif.jpg", EXIF_EMPTY, "");
await testFullFlow(
  "20150306_153340 Cable internet dans la rue.jpg",
  "2015:03:06 15:33:40",
  "My Title",
  90
);
await testFullFlow("canon.JPG", "2018:02:04 13:17:50", "");
await testFullFlow("petitAppPhoto.jpg", "2020:01:19 01:24:02", "");
await testFullFlow(
  "2019-09-03 12-48/20190903_124722.jpg",
  "2019:09:03 12:47:21",
  "",
  90
);

await test("should normalize extensions when necessary", function () {
  const f = buildFileAs(dataPathUnit("1.jpeg"), FilePicture);
  assert.equal(f.i_f_extension.expected, ".jpg");
});

await test("should get exif rotation from files", async (t) => {
  const testRotation = async function (filename: string, angle: number) {
    await t.test(`${filename} with ${angle}`, () => {
      const f = buildFileAs(dataPathUnit(filename), FilePicture);
      assert.equal(f.i_fe_orientation.initial, angle);
    });
  };

  await testRotation("rotated.jpg", 270);
  await testRotation("rotated-ok.jpg", 0);
  await testRotation("rotated-bottom-left.jpg", 270);
  await testRotation("rotated-right-top.jpg", 90);
  await testRotation("petitAppPhoto.jpg", 0);
  await testRotation("no_exif.jpg", 0);
});
