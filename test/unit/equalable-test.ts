import assert from "assert";
import test from "node:test";
import { Equalable, isEqual } from "../../src/lib/equalable";
import { GenericTime } from "../../src/lib/generic-time";

class EqualableTest extends Equalable {
  id: number;

  constructor(id: number) {
    super();
    this.id = id;
  }

  equals(t: EqualableTest) {
    return t.id == this.id;
  }

  toString() {
    return "" + this.id;
  }
}

await test("equalable", () => {
  assert.ok(isEqual());
  assert.ok(isEqual(null, null));
  assert.ok(isEqual(true, true));
  assert.ok(isEqual(1, 1));
  assert.ok(isEqual("", ""));
  assert.ok(isEqual(new EqualableTest(1), new EqualableTest(1)));
  assert.ok(isEqual(new EqualableTest(1), "1"));
  assert.ok(isEqual(GenericTime.from2x3String("2001-02-03"), "2001-02-03"));
  assert.ok(isEqual(GenericTime.empty(), GenericTime.EMPTY_MESSAGE));

  assert.ok(!isEqual(undefined, null));
  assert.ok(!isEqual(undefined, true));
  assert.ok(!isEqual(null, undefined));

  assert.ok(!isEqual(null, 123));

  assert.ok(!isEqual(true, false));
  assert.ok(!isEqual(1, 2));
  assert.ok(!isEqual("", "blabla"));

  assert.ok(!isEqual(new EqualableTest(1), new EqualableTest(123)));
});
