import assert from "node:assert";
import test from "node:test";

import { coordonate2tz } from "../../src/helpers/time-helpers";

await test("coordonate2tz", () => {
  assert.equal(
    coordonate2tz("50 deg 35' 30.84\" N, 5 deg 33' 25.92\" E"),
    "Europe/Brussels"
  );
});
