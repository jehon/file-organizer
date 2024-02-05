import assert from "node:assert";
import test from "node:test";

await test("should be true", () => {
  assert.ok(true);
});

await test("should work with expectAsync", async function () {
  await Promise.resolve({ a: 1, b: 2 });

  assert.equal((await Promise.resolve({ a: 1, b: 2 })).a, 1);

  await assert.rejects(() => Promise.reject({ a: 1, b: 2 }));

  await assert.rejects(() => Promise.reject({ a: 1, b: 2 }), { a: 1 });
});
