import assert from "node:assert";
import test from "node:test";

import { withFirstUpperCase } from "../../src/helpers/string-helpers";

await test("should work", function () {
  assert.equal(withFirstUpperCase("a"), "A");
  assert.equal(withFirstUpperCase("A"), "A");
  assert.equal(withFirstUpperCase("abc"), "Abc");
  assert.equal(withFirstUpperCase("abC"), "AbC");

  assert.equal(withFirstUpperCase(""), "");
});
