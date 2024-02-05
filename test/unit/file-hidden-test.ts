import assert from "node:assert";
import test from "node:test";

import FileHidden from "../../src/file-types/file-hidden";
import { buildFileAs } from "../../src/lib/buildFile";
import { createEmptyUnitFile } from "./test-unit-helpers";

await test("should be always good", async function () {
  const fn = createEmptyUnitFile(".hidden");
  const f = buildFileAs(fn, FileHidden);
  await f.runAllFixes();
  assert.equal(f.modifiedValuesKeys().length, 0);

  f.assertIsFixed();
});
