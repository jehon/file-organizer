import assert from "node:assert";
import test, { beforeEach } from "node:test";
import { getFolderByName, getParentOf } from "../../src/file-types/file-folder";
import buildFile from "../../src/lib/buildFile";
import { createEmptyUnitFile } from "./test-unit-helpers";

await test("normal folder", () => {
  assert.equal(
    getFolderByName("/etc/default").i_f_path_full.current,
    "/etc/default"
  );
});

await test("cache", () => {
  const id1 = getFolderByName("/etc/default").id;
  assert.equal(getFolderByName("/etc/default").id, id1);
});

await test("top root folder", () => {
  // NullItem is the top element
  assert.equal(getFolderByName("/").isTop(), false);
  assert.equal(getParentOf("/").isTop(), false);

  assert.equal(getFolderByName("/etc/default").isTop(), false);
  assert.equal(getFolderByName(".").isTop(), false);
});

await test("reservations by qualif", async function (t: TestContext) {
  const qualif = "qualif";
  const fnNoQualif = createEmptyUnitFile("reservations/text.txt");
  const fnWith = (qualif: string) =>
    createEmptyUnitFile(`reservations/text [${qualif}].txt`);
  const fnQualif = fnWith(qualif);

  beforeEach(() => {
    getParentOf(fnNoQualif).reset();
  });

  await t.test("should keep qualif if available", function () {
    const fnq = buildFile(fnNoQualif);
    fnq.i_f_qualif.expect("other_qualif");
    // reserveFreeIndex(fnq);
  });

  await t.test("should take empty qualif if available", function () {
    buildFile(fnQualif); // Hold the 'qualif'
    const fnq = buildFile(fnNoQualif);
    // This reservation would collide with "fq", so a new qualif would be taken
    fnq.i_f_qualif.expect(qualif);
    // It should get the emtpy qualif
    // assert.equal(getAvailableIndex(fnq), "");
  });

  await t.test("should fallback to numerical qualif", function () {
    buildFile(fnNoQualif);
    buildFile(fnWith("1"));
    buildFile(fnWith("2"));
    buildFile(fnWith("3"));
    const ft = buildFile(fnWith("test"));
    ft.i_f_qualif.expect("");
    // // We should receive a numerical index (empty, 1, 2, 3 are taken)
    // assert.equal(getAvailableIndex(ft), "4");
  });
});
