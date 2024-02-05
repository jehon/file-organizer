import assert from "node:assert";
import test from "node:test";

import { GenericTime } from "../../src/lib/generic-time";
import Value, { currentCalculatedValueFactory } from "../../src/lib/value";

await test("should have properties and methods", function () {
  const v = new Value("test");

  assert.equal(v.initial, "test");
  assert.equal(v.current, "test");
  assert.equal(v.expected, "test");

  v.expect("new");

  assert.ok(!v.isDone());
  assert.ok(!v.isModified());
  assert.equal(v.messages.length, 0);

  v.expect("new", "because");
  assert.equal(v.messages.length, 0);

  v.expect("new2", "because");
  assert.equal(v.messages.length, 1);

  v.fixed();

  assert.ok(v.isDone());
  assert.ok(v.isModified());

  v.expect("new3");
  v.revert();
  assert.ok(v.isDone());
  assert.equal(v.expected, v.current);
});

await test("should fire events", function (_ctx, done) {
  const v = new Value<string>("test");

  v.onExpectedChanged(() => {
    done();
  });

  v.expect("123");
});

await test("should equals", function () {
  const v = new Value<string>("test");

  assert.ok(v.equals("a", "a"));
  assert.ok(!v.equals("a", "b"));

  const vgt = new Value<GenericTime>(GenericTime.from2x3String("2021"));
  assert.ok(
    vgt.equals(
      GenericTime.from2x3String("2020"),
      GenericTime.from2x3String("2020")
    )
  );
  assert.ok(
    !vgt.equals(
      GenericTime.from2x3String("2020"),
      GenericTime.from2x3String("2021")
    )
  );
});

await test("withCanonize without fixAlso", function () {
  const v = new Value("test").withCanonize((v) => "123" + v);
  v.expect("new_value");
  assert.equal(v.expected, "123new_value");
});

await test("withFix", async function (t) {
  await t.test("without fixAlso", function () {
    const v = new Value("test");
    v.expect("new_value");
    v.fixed();
    assert.equal(v.current, "new_value");
  });

  await t.test("with fixAlso", function () {
    const v2 = new Value("test2").expect("new_value_2");
    const v = new Value("test").withFix(async () => {}, [v2]);
    v.expect("new_value");
    v.fixed();
    assert.equal(v.current, "new_value");
    assert.equal(v2.current, "new_value_2");
  });
});

await test("withExpectedFrozen", function () {
  const v = new Value("test");
  assert.equal(v.expected, "test");
  v.withExpectedFrozen("test2");
  assert.equal(v.expected, "test2");
  assert.throws(() => v.expect("anything"));
});

await test("withCurrentCalculated", function () {
  const v = currentCalculatedValueFactory("Because...", () => true);
  assert.equal(v.current, true);
});

await test("withExpectedCalculated", async function (t) {
  await t.test("without basedOn", function () {
    const v = new Value("test").withExpectedCalculated(() => "2");

    assert.equal(v.expected, "2");
  });

  await t.test("with basedOn", function (_ctx, done) {
    const emitter = new Value("test");
    const v = new Value("test").withExpectedCalculated(() => "2", [emitter]);

    assert.equal(v.expected, "2");

    v.onExpectedChanged(() => {
      done();
    });

    emitter.expect("anything");
  });
});
