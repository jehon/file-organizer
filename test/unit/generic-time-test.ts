import assert from "node:assert";
import test from "node:test";
import { GenericTime } from "../../src/lib/generic-time";
import { assertIsEqual } from "./test-unit-helpers";

await test("factories", async function (t) {
  await t.test("empty", () => {
    const gt = GenericTime.empty();
    assert.equal(gt.to2x3String(), "0000-00-00 00-00-00");
    assert.equal(gt.isDateTime(), false);
    assert.equal(gt.isDateTimeFull(), false);
    assert.equal(gt.isRange(), false);
    assert.equal(gt.isEmpty(), true);
  });

  await t.test("fromDashedString", () => {
    const gt = GenericTime.from2x3String("2020-01-02 03-04-05");
    assert.equal(gt.to2x3String(), "2020-01-02 03-04-05");
    assert.equal(gt.isDateTime(), true);
    assert.equal(gt.isDateTimeFull(), true);
    assert.equal(gt.isRange(), false);
    assert.equal(gt.isEmpty(), false);
  });

  await t.test("new Date(2010, 0, 2, 3, 4, 5)", () => {
    const gt = GenericTime.fromDate(new Date(2010, 0, 2, 3, 4, 5));
    assert.equal(gt.to2x3String(), "2010-01-02 03-04-05");
    assert.equal(gt.isDateTime(), true);
    assert.equal(gt.isDateTimeFull(), true);
    assert.equal(gt.isRange(), false);
    assert.equal(gt.isEmpty(), false);
  });

  await t.test("fromParts", () => {
    const gt = GenericTime.fromParts(2020, 1, 2, 3, 4, 5);
    assert.equal(gt.to2x3String(), "2020-01-02 03-04-05");
    assert.equal(gt.isDateTime(), true);
    assert.equal(gt.isDateTimeFull(), true);
    assert.equal(gt.isRange(), false);
    assert.equal(gt.isEmpty(), false);
  });

  await t.test("fromRange", () => {
    const gt = GenericTime.fromRange(2020, 2030);
    assert.equal(gt.to2x3String(), "2020-2030");
    assert.equal(gt.isDateTime(), false);
    assert.equal(gt.isDateTimeFull(), false);
    assert.equal(gt.isRange(), true);
    assert.equal(gt.isEmpty(), false);
  });

  await t.test("fromYear", () => {
    const gt = GenericTime.fromYear(2020);
    assert.equal(gt.to2x3String(), "2020-01-01 01-01-01");
    assert.equal(gt.isDateTime(), true);
    assert.equal(gt.isDateTimeFull(), false);
    assert.equal(gt.isRange(), false);
    assert.equal(gt.isEmpty(), false);
  });

  await t.test("fromYearMonth", () => {
    const gt = GenericTime.fromYearMonth(2020, 1);
    assert.equal(gt.to2x3String(), "2020-01-02 02-02-02");
    assert.equal(gt.isDateTime(), true);
    assert.equal(gt.isDateTimeFull(), false);
    assert.equal(gt.isRange(), false);
    assert.equal(gt.isEmpty(), false);
  });
});

await test("special cases", function () {
  const dt1 = GenericTime.fromParts();
  assert.equal(dt1.to2x3StringForHuman(), "");
  assert.equal(dt1.to2x3String(), "0000-00-00 00-00-00");

  const dt2 = GenericTime.fromParts(2020);
  assert.equal(dt2.to2x3StringForHuman(), "2020");
  assert.equal(dt2.to2x3String(), "2020-01-01 01-01-01");

  const dt3 = GenericTime.fromParts(2020, 10);
  assert.equal(dt3.to2x3StringForHuman(), "2020-10");
  assert.equal(dt3.to2x3String(), "2020-10-02 02-02-02");

  const dt4 = GenericTime.fromParts(2020, 10, 8);
  assert.equal(dt4.to2x3StringForHuman(), "2020-10-08");
  assert.equal(dt4.to2x3String(), "2020-10-08 00-00-00");
});

await test("equal", function () {
  assert.ok(
    GenericTime.fromParts(2020, 10, 8).equals(
      GenericTime.fromParts(2020, 10, 8)
    )
  );
  assert.ok(GenericTime.empty().equals(GenericTime.empty()));
  assert.ok(GenericTime.from2x3String("").equals(GenericTime.empty()));
  assert.ok(
    GenericTime.from2x3String("").equals(GenericTime.from2x3String(""))
  );
});

await test("toTemporalPlainYearMonth", function () {
  assert.equal(
    GenericTime.fromParts(2020, 1, 2).toTemporalPlainYearMonth().toString(),
    "2020-01"
  );
  assert.equal(
    GenericTime.fromParts(2020, 1, 2)
      .toTemporalPlainYearMonth()
      .add({ months: 12 })
      .toString(),
    "2021-01"
  );
});

await test("isAfter", function () {
  assert.ok(
    GenericTime.from2x3String("2022-01-02 03-04-05").isAfter(
      GenericTime.from2x3String("2020-01-02 03-04-05")
    )
  );
  assert.ok(
    !GenericTime.from2x3String("2020-01-02 03-04-05").isAfter(
      GenericTime.from2x3String("2022-01-02 03-04-05")
    )
  );
  assert.ok(
    GenericTime.from2x3String("2020-01-02 03-04-05").isAfter(
      GenericTime.empty()
    )
  );
  assert.ok(GenericTime.empty().isAfter(GenericTime.empty()));
});

await test("should isMorePreciseThan", function () {
  assert.ok(
    GenericTime.from2x3String("2018-01-02").isMorePreciseThan(
      GenericTime.from2x3String("2018-01-02")
    )
  );
  assert.ok(
    GenericTime.from2x3String("2018-01-02").isMorePreciseThan(
      GenericTime.from2x3String("2018-01")
    )
  );
  assert.ok(
    GenericTime.from2x3String("2018-01-02").isMorePreciseThan(
      GenericTime.from2x3String("2018")
    )
  );
  assert.ok(
    GenericTime.from2x3String("2018-01-02").isMorePreciseThan(
      GenericTime.fromRange(2018, 2019)
    )
  );
  assert.ok(
    GenericTime.from2x3String("2018-01-02").isMorePreciseThan(
      GenericTime.empty()
    )
  );
  assert.ok(GenericTime.empty().isMorePreciseThan(GenericTime.empty()));

  assert.ok(
    GenericTime.from2x3String("2019-01-01").isMorePreciseThan(
      GenericTime.from2x3String("2019-02-02"),
      true
    )
  );

  //
  // Not matching
  //

  assert.ok(
    !GenericTime.from2x3String("2018-01-02").isMorePreciseThan(
      GenericTime.from2x3String("2019")
    )
  );

  assert.ok(
    !GenericTime.from2x3String("2018-01-02").isMorePreciseThan(
      GenericTime.fromRange(2019, 2020)
    )
  );

  assert.ok(
    !GenericTime.empty().isMorePreciseThan(GenericTime.from2x3String("2019"))
  );

  assert.ok(
    !GenericTime.from2x3String("2019-01-01").isMorePreciseThan(
      GenericTime.from2x3String("2019-03-02"),
      true
    )
  );
});

await test("convertTimezone(*, UTC)", function () {
  assertIsEqual(
    GenericTime.from2x3String("2018-01-02 03-04-05").convertTimezone(
      "Europe/Brussels",
      GenericTime.TZ_UTC
    ),
    "2018-01-02 02-04-05"
  );

  assertIsEqual(
    GenericTime.from2x3String("2018-01-02 03-04-05").convertTimezone(
      "",
      GenericTime.TZ_UTC
    ),
    "2018-01-02 02-04-05"
  );

  // Winter time
  assertIsEqual(
    GenericTime.from2x3String("2018-01-02 03-04-05").convertTimezone(
      "Europe/Brussels",
      GenericTime.TZ_UTC
    ),
    "2018-01-02 02-04-05"
  );

  // Summer time
  assertIsEqual(
    GenericTime.from2x3String("2018-07-02 03-04-05").convertTimezone(
      "Europe/Brussels",
      GenericTime.TZ_UTC
    ),
    "2018-07-02 01-04-05"
  );

  assertIsEqual(
    GenericTime.from2x3String("2018-07-02 03-04-05").convertTimezone(
      "Asia/Dhaka",
      GenericTime.TZ_UTC
    ),
    "2018-07-01 21-04-05"
  );
});

await test("convertTimezone(UTC, *)", function () {
  assertIsEqual(
    GenericTime.from2x3String("2018-01-02 02-04-05").convertTimezone(
      GenericTime.TZ_UTC,
      "Europe/Brussels"
    ),
    "2018-01-02 03-04-05"
  );

  assertIsEqual(
    GenericTime.from2x3String("2018-01-02 02-04-05").convertTimezone(
      GenericTime.TZ_UTC,
      ""
    ),
    "2018-01-02 03-04-05"
  );

  // Winter time
  assertIsEqual(
    GenericTime.from2x3String("2018-01-02 03-04-05").convertTimezone(
      GenericTime.TZ_UTC,
      "Europe/Brussels"
    ),
    "2018-01-02 04-04-05"
  );

  // Summer time
  assertIsEqual(
    GenericTime.from2x3String("2018-07-02 03-04-05").convertTimezone(
      GenericTime.TZ_UTC,
      "Europe/Brussels"
    ),
    "2018-07-02 05-04-05"
  );

  assertIsEqual(
    GenericTime.from2x3String("2018-07-01 21-04-05").convertTimezone(
      GenericTime.TZ_UTC,
      "Asia/Dhaka"
    ),
    "2018-07-02 03-04-05"
  );
});
