import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import File from "../../src/file-types/file";
import FileFolder, {
  _resetFolderCache,
  getParentOf
} from "../../src/file-types/file-folder";
import { fsFileExists } from "../../src/helpers/fs-helpers";
import { buildFileAs } from "../../src/lib/buildFile";
import {
  assertIsEqual,
  createEmptyUnitFile,
  createFileFromDataUnit,
  createFolderRecursively,
  dataPathUnit,
  fromCWD,
  tempPathUnit
} from "./test-unit-helpers";

await test("with attributes", async (t) => {
  await t.test("initial", async (t) => {
    await t.test("parse filename", function () {
      const f = buildFileAs(
        dataPathUnit("20150306_153340 Cable internet dans la rue.jpg"),
        File
      );
      assert.equal(f.i_f_qualif.initial, "20150306_153340");
      assert.equal(f.i_f_title.initial, "Cable internet dans la rue");
      assertIsEqual(f.i_f_time.initial, "2015-03-06 15-33-40");
    });

    await t.test("should give a parent", () => {
      assert.equal(
        buildFileAs(dataPathUnit("canon.JPG"), File).getParentValue().current
          .i_f_path_full.current,
        fromCWD("test/unit/data")
      );
    });
  });

  await t.test("expected", async (t) => {
    await t.test("should parse remove duplicate title/qualif", function () {
      const filepath = createEmptyUnitFile(
        "vie de famille [vie de famille].txt"
      );
      const f = buildFileAs(filepath, File);
      assert.equal(f.i_f_qualif.expected, "");
      assert.equal(f.i_f_title.expected, "vie de famille");
    });

    await t.test("should calculate a canonicalFilename", function () {
      const f1 = createEmptyUnitFile("2018-02-04");
      assert.equal(buildFileAs(f1, File).i_f_filename.expected, "2018-02-04");

      const f2 = createEmptyUnitFile("2018-02-04 13-17-50 canon");
      assert.equal(
        buildFileAs(f2, File).i_f_filename.expected,
        "2018-02-04 13-17-50 canon"
      );

      const f3 = createEmptyUnitFile("2020-01-19 01-24-02 petitAppPhoto");
      assert.equal(
        buildFileAs(f3, File).i_f_filename.expected,
        "2020-01-19 01-24-02 petitAppPhoto"
      );

      const f4 = createEmptyUnitFile("petitAppPhoto");
      assert.equal(
        buildFileAs(f4, File).i_f_filename.expected,
        "petitAppPhoto"
      );
    });
  });
});

await test("with values", async function (t) {
  await t.test(
    "File.i_f_path_full, File.i_f_filename and File.i_f_extension",
    async function (t) {
      await t.test("should read the data", async function (t) {
        await t.test("should extract extension", () => {
          const f1 = createEmptyUnitFile("a.txt");
          assert.equal(buildFileAs(f1, File).i_f_extension.initial, ".txt");

          const f2 = createEmptyUnitFile("a");
          assert.equal(buildFileAs(f2, File).i_f_extension.initial, "");
        });

        await t.test("should extract filename", () => {
          {
            const f = createEmptyUnitFile("a.txt");
            getParentOf(f).reset();
            assert.equal(buildFileAs(f, File).i_f_filename.initial, "a.txt");
          }

          {
            const f = createEmptyUnitFile("a");
            getParentOf(f).reset();
            assert.equal(buildFileAs(f, File).i_f_filename.initial, "a");
          }

          {
            const f = createEmptyUnitFile("test/a.txt");
            getParentOf(f).reset();
            assert.equal(buildFileAs(f, File).i_f_filename.initial, "a.txt");
          }

          {
            const f = createEmptyUnitFile("test/a");
            getParentOf(f).reset();
            assert.equal(buildFileAs(f, File).i_f_filename.initial, "a");
          }
        });

        await t.test(
          "with modifying one value, should keep filepath up-to-date",
          function () {
            const f1 = createEmptyUnitFile("test_rename/brol/a.txt");
            const f = buildFileAs(f1, File);
            assert.equal(
              f.i_f_path_full.current,
              fromCWD("tmp/unit/test_rename/brol/a.txt")
            );

            f.i_f_title.expect("b");
            assert.equal(
              f.i_f_path_full.expected,
              fromCWD("tmp/unit/test_rename/brol/b.txt")
            );

            f.i_f_extension.expect(".jpg");
            assert.equal(
              f.i_f_path_full.expected,
              fromCWD("tmp/unit/test_rename/brol/b.jpg")
            );
          }
        );
      });

      await t.test("with fix File.i_f_path_full", async function (t) {
        await t.test("from File.i_f_extension", async function () {
          const filename = createEmptyUnitFile("text-fix.txt");
          const f = buildFileAs(filename, File);

          f.i_f_extension.expect(".TX2");
          await f.i_f_path_full.runFixValue();

          assert.ok(fsFileExists(f.i_f_path_full.current));
          assert.ok(f.i_f_path_full.current.endsWith(".TX2"));

          // Force rebuild the file
          _resetFolderCache();

          const f2 = buildFileAs(f.i_f_path_full.current, File);
          assert.equal(f2.i_f_extension.expected, ".tx2");
          await f2.i_f_path_full.runFixValue();

          assert.ok(f2.i_f_path_full.current.endsWith(".tx2"));
          assert.ok(fsFileExists(f2.i_f_path_full.current));
        });

        await t.test("from File.i_f_filename", async () => {
          const filename = createFileFromDataUnit(
            "20150306_153340 Cable internet dans la rue.jpg",
            "file-test"
          );
          const f = buildFileAs(filename, File);
          assert.equal(
            f.i_f_filename.current,
            "20150306_153340 Cable internet dans la rue.jpg"
          );
          assert.equal(
            f.i_f_path_full.current,
            tempPathUnit(
              "file-test",
              "20150306_153340 Cable internet dans la rue.jpg"
            )
          );

          await f.i_f_path_full.runFixValue();
          assert.equal(
            f.i_f_filename.current,
            "2015-03-06 15-33-40 Cable internet dans la rue [20150306_153340].jpg"
          );
          assert.equal(
            f.i_f_path_full.current,
            tempPathUnit(
              "file-test",
              "2015-03-06 15-33-40 Cable internet dans la rue [20150306_153340].jpg"
            )
          );

          assert.equal(
            f.i_f_filename.expected,
            "2015-03-06 15-33-40 Cable internet dans la rue [20150306_153340].jpg"
          );
          assert.equal(
            f.i_f_path_full.expected,
            tempPathUnit(
              "file-test",
              "2015-03-06 15-33-40 Cable internet dans la rue [20150306_153340].jpg"
            )
          );
        });

        await t.test("from File.i_f_path_full", async () => {
          const filename = createEmptyUnitFile("file-test-1/test-pathfull.txt");
          const f = buildFileAs(filename, File);

          // Build up a new folder
          const newFolderpath = path.join(filename, "../test");
          createFolderRecursively(newFolderpath);
          const newRoot = buildFileAs(newFolderpath, FileFolder);
          await newRoot.runAllFixes();
          newRoot.assertIsFixed();

          // Set the new parent
          f.getParentValue().expect(newRoot);
          assert.equal(f.i_f_path_full.current, filename);
          assert.equal(
            f.i_f_path_full.expected,
            path.join(newFolderpath, path.basename(filename))
          );

          // Move the file
          await f.i_f_path_full.runFixValue();
          assert.equal(
            f.i_f_path_full.current,
            tempPathUnit("file-test-1", "test", "test-pathfull.txt")
          );
          assert.ok(fsFileExists(f.i_f_path_full.current));
        });
      });
    }
  );

  await t.test("File.i_00_f_exists and File.i_f_is_folder", async function (t) {
    await t.test("should read the data", async function (t) {
      await t.test("should read file", async () => {
        let f;
        try {
          const fp = createEmptyUnitFile("text.txt");
          f = buildFileAs(fp, File);

          assert.ok(f.i_00_f_exists.current);
          assert.ok(!f.i_f_is_folder.current);
        } finally {
          if (f && fsFileExists(f.currentFilepath))
            await fs.promises.unlink(f.currentFilepath);
        }
      });

      await t.test("should read folder", function () {
        getParentOf(tempPathUnit()).reset();
        const f = buildFileAs(tempPathUnit(), File);

        assert.ok(f.i_00_f_exists.current);
        assert.ok(f.i_f_is_folder.current);
      });
    });
  });
});
