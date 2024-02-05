import assert from "node:assert";
import test from "node:test";
import { regexps } from "../../src/lib/timestamp";

import { filenameIsA } from "./test-unit-helpers";

await test("parsing human readable", async function (t) {
  //
  //
  // Parsing
  //
  //
  await t.test('should parse "final" elements', function () {
    filenameIsA("2018", "final", "2018");
    filenameIsA("2018-09-08", "final", "2018-09-08");
    filenameIsA("2018-09-08 13-14-15", "final", "2018-09-08 13-14-15");

    filenameIsA("2018-09-08 13-14-15 test", "final", "2018-09-08 13-14-15");

    filenameIsA("2018-09-08 13-14-15 [file]", "final", "2018-09-08 13-14-15", {
      title: "",
      qualif: "file"
    });

    filenameIsA(
      "2018-09-08 13-14-15 test [file]",
      "final",
      "2018-09-08 13-14-15",
      {
        title: "test",
        qualif: "file"
      }
    );

    filenameIsA("2018-09-08 test [file]", "final", "2018-09-08", {
      title: "test",
      qualif: "file"
    });

    // Year only
    filenameIsA("2018 test [file]", "final", "2018", {
      title: "test",
      qualif: "file"
    });

    // Year only
    filenameIsA("2018 test", "final", "2018", {
      title: "test",
      qualif: ""
    });

    filenameIsA(
      "2015-12-11 02-03-55 Bangladesh - A la mer",
      "final",
      "2015-12-11 02-03-55",
      {
        title: "Bangladesh - A la mer",
        qualif: ""
      }
    );

    filenameIsA("2019-03-24 12-14-46", "final", "2019-03-24 12-14-46");

    // Year only
    filenameIsA("2018 bonjour 2019", "final", "2018", {
      title: "bonjour 2019",
      qualif: ""
    });

    // Year-month only
    filenameIsA("2018-01 bonjour 2019", "final", "2018-01", {
      title: "bonjour 2019",
      qualif: ""
    });

    // Year-month-day only
    filenameIsA("2018-01-15 bonjour 2019", "final", "2018-01-15", {
      title: "bonjour 2019",
      qualif: ""
    });
  });

  await t.test("should parse old elements", function () {
    filenameIsA("1980", "final", "1980");
    filenameIsA("1980-01", "final", "1980");
    filenameIsA("1980-02", "final", "1980-02");
    filenameIsA("1980-02-01", "final", "1980-02");
    filenameIsA("1980-02-03", "final", "1980-02-03");
  });

  await t.test("should parse timestamps elements", function () {
    // With timezone
    filenameIsA("2019:03:24 12:14:46+01:00", "final", "2019-03-24 12-14-46");
  });

  await t.test("should parse canon pictures and movies", function () {
    filenameIsA("DSC_1234", "raw8_3", "", {
      title: "",
      qualif: "DSC_1234"
    });
  });

  await t.test('should parse "android" elements', function () {
    filenameIsA("VID_20180102_030405", "androidCamera", "2018-01-02 03-04-05", {
      title: "",
      qualif: "VID_20180102_030405"
    });

    filenameIsA("IMG_20180102_030405", "androidCamera", "2018-01-02 03-04-05", {
      title: "",
      qualif: "IMG_20180102_030405"
    });

    filenameIsA("IMG-20180915-WA0001", "androidWhatsApp", "2018-09-15", {
      title: "",
      qualif: "IMG-20180915-WA0001"
    });

    assert.ok(regexps.androidCamera.test("IMG_20180304_050607"));
    assert.ok(regexps.androidCamera.test("VID_20121215_111704"));
  });

  await t.test('should parse "screen" elements', function () {
    filenameIsA("20150306_153340", "screen", "2015-03-06 15-33-40", {
      title: "",
      qualif: "20150306_153340"
    });

    filenameIsA(
      "20150306_153340 Cable internet dans la rue",
      "screen",
      "2015-03-06 15-33-40",
      {
        title: "Cable internet dans la rue",
        qualif: "20150306_153340"
      }
    );
  });

  await t.test('should parse "yearRange" elements', function () {
    filenameIsA("2015-2016", "yearRange", "2015-2016", {
      title: "",
      qualif: ""
    });

    filenameIsA("2015-2016 with title", "yearRange", "2015-2016", {
      title: "with title",
      qualif: ""
    });

    filenameIsA("2015-2016 with title [brol]", "yearRange", "2015-2016", {
      title: "with title",
      qualif: "brol"
    });
  });

  await t.test("should parse minimal format", function () {
    filenameIsA("canon", "minimal", "", { title: "canon" });

    filenameIsA("canon brol", "minimal", "", { title: "canon brol" });

    filenameIsA("brol - machin", "minimal", "", {
      title: "brol - machin"
    });

    filenameIsA("canon brol [truc]", "minimal", "", {
      title: "canon brol",
      qualif: "truc"
    });
  });

  await t.test("should detect invalid formats", function () {
    filenameIsA("2018-01-02-03", "invalid", "", {
      title: "2018-01-02-03"
    });

    filenameIsA("brol 2018-01-02 machin", "invalid", "", {
      title: "brol 2018-01-02 machin"
    });
  });
});
