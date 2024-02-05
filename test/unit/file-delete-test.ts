import assert from "node:assert";
import test from "node:test";

import FileDelete from "../../src/file-types/file-delete";
import { fsFileExists } from "../../src/helpers/fs-helpers";
import { buildFileAs } from "../../src/lib/buildFile";
import { createEmptyUnitFile } from "./test-unit-helpers";

await test("should delete a file", async function () {
  const filepath = createEmptyUnitFile("text-delete.txt");
  const f = buildFileAs(filepath, FileDelete);
  await f.runAllFixes();
  f.assertIsFixed();

  assert.ok(!fsFileExists(f.currentFilepath));
});
