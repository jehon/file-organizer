import path from "node:path";
import test from "node:test";
import FileMovieUTC from "../../src/file-types/file-movie-utc";
import FilePicture from "../../src/file-types/file-picture";
import fromTestSuite, {
  filenameIsA,
  TestDefaultTitle
} from "./test-source-helpers";

const source = "android-camera";

//
// There is a 2 seconds difference due to android ?
//

await test(source + ": image", async function (t) {
  await t.test("should parse", () => {
    filenameIsA("20211225_202250", "screen", "2021-12-25 20-22-50", {
      title: "",
      qualif: "20211225_202250"
    });
  });

  await fromTestSuite(
    t,
    path.join(source, "20211225_202250.jpg"),
    {
      initial: {},
      current: {
        i_f_title: "",
        // The image is 20:22:48
        i_f_time: "2021-12-25 20-22-50"
      },
      expected: {
        i_f_title: TestDefaultTitle,
        i_f_time: "2021-12-25 20-22-50",
        i_f_filename: `2021-12-25 20-22-50 ${TestDefaultTitle} [20211225_202250].jpg`
      }
    },
    { type: FilePicture }
  );
});

await test(source + ": video", async function (t) {
  await t.test("should parse", () => {
    filenameIsA("20211225_202302", "screen", "2021-12-25 20-23-02", {
      title: "",
      qualif: "20211225_202302"
    });
  });

  await fromTestSuite(
    t,
    path.join(source, "20211225_202302.mp4"),

    {
      initial: {},
      current: {
        // The image is 20:23:04
        // Exif:
        //   "CreateDate": "2021:12:25 19:23:06",
        i_f_title: "",
        i_f_time: "2021-12-25 20-23-02",
        i_fe_time: "2021:12:25 19:23:06"
      },
      expected: {
        i_f_title: TestDefaultTitle,
        i_f_time: "2021-12-25 20-23-06",
        i_f_filename: `2021-12-25 20-23-06 ${TestDefaultTitle} [20211225_202302].mp4`
      }
    },
    { type: FileMovieUTC }
  );
});
