import path from "node:path";
import test from "node:test";
import FileMovieUTC from "../../src/file-types/file-movie-utc";
import FilePicture from "../../src/file-types/file-picture";
import fromTestSuite, {
  TestDefaultTitle,
  filenameIsA
} from "./test-source-helpers";

const source = "android-whatsapp";

//
// There is a 2 seconds difference due to android ?
//

await test(source + ": image", async function (t) {
  await t.test("should parse", () => {
    filenameIsA("IMG-20211226-WA0001", "androidWhatsApp", "2021-12-26", {
      title: "",
      qualif: "IMG-20211226-WA0001"
    });
  });

  await fromTestSuite(
    t,
    path.join(source, "IMG-20211226-WA0001.jpeg"),
    {
      initial: {},
      current: {
        i_f_title: "",
        // The image is 2021-12-26 13:13:02 (winter time)
        i_f_time: "2021-12-26"
      },
      expected: {
        i_f_title: TestDefaultTitle,
        i_f_time: "2021-12-26 13-13-02",
        i_f_filename: `2021-12-26 13-13-02 ${TestDefaultTitle} [IMG-20211226-WA0001].jpg`
      }
    },
    { type: FilePicture, mtime: "2019-01-02 03:04:05" }
  );
});

await test(source + ": video", async function (t) {
  await t.test("should parse", () => {
    filenameIsA("VID-20211226-WA0003", "androidWhatsApp", "2021-12-26", {
      title: "",
      qualif: "VID-20211226-WA0003"
    });
  });

  await fromTestSuite(
    t,
    path.join(source, "VID-20211226-WA0003.mp4"),
    {
      initial: {},
      current: {
        i_fe_time: "2021:12:26 12:13:17", // UTC
        i_f_title: "",
        // The image is 2021-12-26 13:13:15 (winter time)
        i_f_time: "2021-12-26"
      },
      expected: {
        i_fe_time: "2021:12:26 12:13:17", // UTC
        i_f_title: TestDefaultTitle,
        i_f_time: "2021-12-26 13-13-17",
        i_f_filename: `2021-12-26 13-13-17 ${TestDefaultTitle} [VID-20211226-WA0003].mp4`
      }
    },
    { type: FileMovieUTC, mtime: "2019-01-02 03:04:05" }
  );
});
