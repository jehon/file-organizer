import assert from "node:assert";
import test from "node:test";
import FileExif, { EXIF_EMPTY } from "../../src/file-types/file-exif";
import { getFolderByName, getParentOf } from "../../src/file-types/file-folder";
import FileMovieUTC from "../../src/file-types/file-movie-utc";
import { buildFileAs } from "../../src/lib/buildFile";
import { GenericTime } from "../../src/lib/generic-time";
import Value, { Flavor } from "../../src/lib/value";
import {
  assertIsEqual,
  createFileFromDataUnit,
  dataPathUnit
} from "./test-unit-helpers";

await test("it should read data", async (t) => {
  await t.test("no exif", function () {
    getFolderByName(dataPathUnit()).reset();
    const f = buildFileAs(dataPathUnit("no_exif.jpg"), FileExif);

    assert.equal(f.i_fe_orientation.initial, 0);
    assert.equal(f.i_fe_tz.initial, "");
    assert.equal(f.i_fe_title.initial, "");
    assert.equal(f.i_fe_time.initial, EXIF_EMPTY);

    assert.equal(f.i_fe_orientation.expected, 0);
  });

  await t.test("time", () => {
    getFolderByName(dataPathUnit()).reset();
    const f = buildFileAs(
      dataPathUnit("1998-12-31 12-10-11 exifok01.jpg"),
      FileExif
    );

    assert.equal(f.i_fe_orientation.initial, 0);
    assert.equal(f.i_fe_tz.initial, "");
    assert.equal(f.i_fe_title.initial, "");
    assert.equal(f.i_fe_time.initial, "1998:12:31 12:10:11");
  });

  await t.test("title", () => {
    getFolderByName(dataPathUnit()).reset();
    const f = buildFileAs(
      dataPathUnit("20150306_153340 Cable internet dans la rue.jpg"),
      FileExif
    );

    assert.equal(f.i_fe_orientation.initial, 90);
    assert.equal(f.i_fe_tz.initial, "");
    assert.equal(f.i_fe_title.initial, "My Title");
    assert.equal(f.i_fe_time.initial, "2015:03:06 15:33:40");

    assert.equal(f.i_fe_orientation.expected, 0);
  });

  await t.test("rotation", () => {
    getFolderByName(dataPathUnit()).reset();
    const f = buildFileAs(dataPathUnit("rotated-bottom-left.jpg"), FileExif);

    assert.equal(f.i_fe_orientation.initial, 270);
    assert.equal(f.i_fe_tz.initial, "");
    assert.equal(f.i_fe_title.initial, "rotated-bottom-left");
    assert.equal(f.i_fe_time.initial, "2000-00-00 00-00-00"); // Erroneous, but like that in the file

    assert.equal(f.i_fe_orientation.expected, 0);
  });
});

await test("should getTS", async (t) => {
  getFolderByName(dataPathUnit()).reset();
  const f = buildFileAs(dataPathUnit("20211225_202250.jpg"), FileExif);

  await t.test("with normal case", () => {
    f.i_fe_time = new Value("2018:01:02 03:04:05");
    assertIsEqual(f.getTS(Flavor.initial), "2018-01-02 03-04-05");

    f.i_fe_time = new Value(EXIF_EMPTY);
    assertIsEqual(f.getTS(Flavor.initial), GenericTime.empty());
  });

  await t.test("with uncomplete dates", () => {
    f.i_fe_time = new Value("2018:01:01 01:01:01");
    assertIsEqual(f.getTS(Flavor.initial), "2018");

    f.i_fe_time = new Value("2018:01:02 02:02:02");
    assertIsEqual(f.getTS(Flavor.initial), "2018-01");

    f.i_fe_time = new Value("2018:02:02 02:02:02");
    assertIsEqual(f.getTS(Flavor.initial), "2018-02");
  });

  await t.test("with timezone and UTC", () => {
    getFolderByName(dataPathUnit()).reset();
    const f = buildFileAs(dataPathUnit("20211225_202250.jpg"), FileMovieUTC);

    f.i_fe_tz = new Value("Europe/Brussels");

    f.i_fe_time = new Value("2019:07:02 15:16:17");
    assertIsEqual(
      f.getTS(Flavor.initial),
      "2019-07-02 17-16-17",
      "Summer time"
    );

    f.i_fe_time = new Value("2019:02:02 15:16:17");
    assertIsEqual(
      f.getTS(Flavor.initial),
      "2019-02-02 16-16-17",
      "Winter time"
    );

    f.i_fe_tz = new Value("Asia/Dhaka");
    f.i_fe_time = new Value("2019:02:02 15:16:17");
    assertIsEqual(
      f.getTS(Flavor.initial),
      "2019-02-02 21-16-17",
      "Winter time in Dhaka"
    );
  });
});

await test("should update TS from i_f_time", async (t) => {
  getFolderByName(dataPathUnit()).reset();
  const f = buildFileAs(dataPathUnit("20211225_202250.jpg"), FileExif);

  await t.test("with normal case", function () {
    f.i_f_time.expect(GenericTime.from2x3String("2018-01-02 03-04-05"));
    assert.equal(f.i_fe_time.expected, "2018:01:02 03:04:05");

    f.i_f_time.expect(GenericTime.empty());
    assert.equal(f.i_fe_time.expected, EXIF_EMPTY);
  });

  await t.test("with uncomplete dates", () => {
    f.i_f_time.expect(GenericTime.from2x3String("2018"));
    assert.equal(f.i_fe_time.expected, "2018:01:01 01:01:01");

    f.i_f_time.expect(GenericTime.from2x3String("2018-01"));
    assert.equal(f.i_fe_time.expected, "2018:01:02 02:02:02");

    f.i_f_time.expect(GenericTime.from2x3String("2018-02"));
    assert.equal(f.i_fe_time.expected, "2018:02:02 02:02:02");
  });

  await t.test("with timezone and UTC", () => {
    getFolderByName(dataPathUnit()).reset();
    const f = buildFileAs(dataPathUnit("20211225_202250.jpg"), FileMovieUTC);

    f.i_fe_tz.expect("Europe/Brussels");

    f.i_f_time.expect(GenericTime.from2x3String("2019-07-02 17-16-17"));
    assert.equal(f.i_fe_time.expected, "2019:07:02 15:16:17", "Summer time");

    f.i_f_time.expect(GenericTime.from2x3String("2019-02-02 16-16-17"));
    assert.equal(f.i_fe_time.expected, "2019:02:02 15:16:17", "Winter time");

    f.i_fe_tz.expect("Asia/Dhaka");
    f.i_f_time.expect(GenericTime.from2x3String("2019-02-02 21-16-17"));
    assert.equal(
      f.i_fe_time.expected,
      "2019:02:02 15:16:17",
      "Winter time in Dhaka"
    );
  });
});

await test("should write", async () => {
  let filename = createFileFromDataUnit("no_exif.jpg");

  // Build up the data to be written
  getFolderByName(dataPathUnit()).reset();
  const f1 = buildFileAs(filename, FileExif);

  assert.equal(f1.i_fe_time.initial, EXIF_EMPTY);

  f1.i_f_time.expect(GenericTime.from2x3String("2020-01-02 03-05-06"));
  assertIsEqual(f1.i_f_time.expected, "2020-01-02 03-05-06");
  assert.ok(f1.i_fe_time.expected, "2020:01:02 03:05:06");
  assert.equal(f1.i_f_filename.expected, "2020-01-02 03-05-06 No_exif.jpg");

  await f1.runAllFixes();
  filename = f1.currentFilepath;

  // Check the data: force reloading the file
  getParentOf(filename).reset();
  const f2 = buildFileAs(filename, FileExif);

  assert.equal(f2.i_fe_time.initial, "2020:01:02 03:05:06");
  assert.equal(f2.i_fe_title.initial, "No_exif");
  filename = f2.currentFilepath;
});
