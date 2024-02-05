import assert from "node:assert";
import test from "node:test";
import FileTimed from "../../src/file-types/file-timed";
import { buildFileAs } from "../../src/lib/buildFile";
import {
  assertIsEqual,
  createEmptyUnitFile,
  dataPathUnit
} from "./test-unit-helpers";

await test("should take the new title from filename", () => {
  const f = buildFileAs(dataPathUnit("canon.JPG"), FileTimed);

  assert.equal(f.i_f_title.expected, "Canon");
});

await test("should check coherence with parent folder", async (t) => {
  await t.test("when it is coherent", () => {
    const filepath = createEmptyUnitFile("2019-10/2019-10-01 text.txt");
    const f = buildFileAs(filepath, FileTimed);
    assert.equal(f.i_ft_is_coherent.current, true);
  });

  await t.test("when it is incoherent", () => {
    const filepath = createEmptyUnitFile("2019-10/2010-10-01 text.txt");
    const f = buildFileAs(filepath, FileTimed);
    assert.equal(f.i_ft_is_coherent.current, false);
  });
});

await test("should parse filename qualif", () => {
  const f = buildFileAs(dataPathUnit("2021-02-03 [blabla].jpg"), FileTimed);
  assertIsEqual(f.i_f_time.initial, "2021-02-03");
  assert.equal(f.i_f_title.initial, "");
  assert.equal(f.i_f_qualif.initial, "blabla");
});
