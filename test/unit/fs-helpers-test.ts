import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  fsFileExists,
  fsFileRename,
  fsFolderListing,
  fsFolderListingRecursively,
  fsIsFolder,
  waitForFileToExists
} from "../../src/helpers/fs-helpers";
import { createEmptyUnitFile, tempPathUnit } from "./test-unit-helpers";

await test("should fsFileExists a file", function () {
  const fn = createEmptyUnitFile("fs-helpers-test-exists.txt");
  assert.ok(fsFileExists(fn));
  assert.ok(!fsFileExists(fn + ".does_not_exists"));
});

await test("should fsIsFolder", () => {
  const fn = createEmptyUnitFile("fs-helpers-test-exists.txt");
  assert.ok(!fsIsFolder(fn));
  assert.ok(fsIsFolder(path.dirname(fn)));
});

await test("should fsFileRename", function () {
  const fp = createEmptyUnitFile("fs-file-rename-test.txt");
  const fpn = fp + ".new";

  fsFileRename(fp, fpn);

  assert.ok(!fsFileExists(fp));
  assert.ok(fsFileExists(fpn));
  fs.unlinkSync(fpn);
});

await test("should fsFolderListing", function () {
  const subFolder = "fs-helpers-test-fsFolderListing";
  createEmptyUnitFile(path.join(subFolder, "test1.txt"));
  createEmptyUnitFile(path.join(subFolder, "test2.txt"));
  createEmptyUnitFile(path.join(subFolder, "test3.txt"));
  createEmptyUnitFile(path.join(subFolder, "test4.txt"));
  createEmptyUnitFile(path.join(subFolder, "test9", "test91.txt"));

  const folderpath = tempPathUnit(subFolder);
  const list = fsFolderListing(folderpath).map((fn) =>
    path.join(folderpath, fn)
  );

  for (const fp of list) {
    assert.ok(fsFileExists(fp));
    assert.notEqual(fp, ".");
    assert.notEqual(fp, "..");
    assert.notEqual(fp, null);
  }
  assert.equal(list.length, 5, "list of files");
});

await test("should fsFolderListingRecursively", function () {
  const subFolder = "fs-helpers-test-fsFolderListingRecursively";
  createEmptyUnitFile(path.join(subFolder, "test1.txt"));
  createEmptyUnitFile(path.join(subFolder, "test2.txt"));
  createEmptyUnitFile(path.join(subFolder, "test3.txt"));
  createEmptyUnitFile(path.join(subFolder, "test4.txt"));
  createEmptyUnitFile(path.join(subFolder, "test9", "test91.txt"));

  const folderpath = tempPathUnit(subFolder);
  const list = fsFolderListingRecursively(folderpath);

  for (const fp of list) {
    assert.ok(fsFileExists(fp));
    assert.notEqual(fp, ".");
    assert.notEqual(fp, "..");
    assert.notEqual(fp, null);
  }
  assert.ok(list.includes(folderpath));
  assert.ok(list.includes(path.join(folderpath, "test1.txt")));
  assert.ok(list.includes(path.join(folderpath, "test2.txt")));
  assert.ok(list.includes(path.join(folderpath, "test9", "test91.txt")));
});

await test("should waitForFileToExists", async function (t: TestContext) {
  const filename = "watched";
  const fileWatched = tempPathUnit(filename);

  await t.test("without file", function () {
    assert.equal(waitForFileToExists(fileWatched, 1), false);
  });

  await t.test("with file at start", function () {
    createEmptyUnitFile(filename);
    assert.equal(waitForFileToExists(fileWatched, 1), true);
  });

  // Impossible to test waitForFileToExists in an sync world
});
