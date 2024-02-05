import assert from "node:assert";
import test from "node:test";

import Item, { NullItem } from "../../src/lib/item";

await test("should handle properties", () => {
  const i = new Item("my title");
  assert.equal(i.title, "my title");
  assert.equal(i.type, "Item");
  const i2 = new Item("2");
  i.i_parent.expect(i2);
  assert.equal(i.i_parent.expected!.id, i2.id);
});

await test("should be built with parent", function () {
  const i2 = new Item("2");
  const i = new Item("2", i2);
  assert.equal(i.i_parent.initial!.id, i2.id);
});

await test("should export a NullItem", function () {
  assert.equal(NullItem.id, 0);
  assert.equal(NullItem.isTop(), true);
  assert.equal(NullItem.i_parent.current, null);
});
