import assert from "node:assert";
import fs from "node:fs";
import test from "node:test";
import File from "../../src/file-types/file";
import { buildFileAs } from "../../src/lib/buildFile";
import { GenericTime } from "../../src/lib/generic-time";
import {
  assertIsEqual,
  createFileFromDataUnit,
  dataPathUnit,
  tempPathUnit
} from "./test-unit-helpers";

const inFolderWithinTmp = "helpers-test";

await test("should have a data path", function () {
  assert.ok(fs.existsSync(dataPathUnit()));
  assert.ok(fs.existsSync(dataPathUnit("..", "data")));
});

await test("should create temp generic file", () => {
  const filename = createFileFromDataUnit(
    "20150306_153340 Cable internet dans la rue.jpg",
    inFolderWithinTmp
  );
  const f = buildFileAs(filename, File);
  assert.equal(
    f.i_f_filename.initial,
    "20150306_153340 Cable internet dans la rue.jpg"
  );
  assert.equal(
    f.getParentValue().current.currentFilepath,
    tempPathUnit(inFolderWithinTmp)
  );
  fs.unlinkSync(f.currentFilepath);
});

await test("should assertIsEqual", function () {
  assertIsEqual(GenericTime.empty(), GenericTime.empty());
  // assertIsEqual(GenericTime.empty(), 2);
});
