import path from "node:path";
import test from "node:test";
import FilePicture from "../../src/file-types/file-picture";
import fromTestSuite, {
  TestDefaultTitle,
  filenameIsA
} from "./test-source-helpers";

const source = "android-dji";

await test(source + ": image", async function (t) {
  await t.test("should parse", () => {
    filenameIsA("DJI_20230701_204055_62", "androidDJI", "2023-07-01 20-40-55", {
      title: "",
      qualif: "DJI_20230701_204055_62"
    });
  });

  await fromTestSuite(
    t,
    path.join(source, "DJI_20231128_105205_30.jpg"),
    {
      initial: {},
      current: {
        i_f_title: "",
        // The image is 2023-11-28 10:52
        i_f_time: "2023-11-28 10-52-05"
      },
      expected: {
        i_f_title: TestDefaultTitle,
        i_f_time: "2023-11-28 10-52-05",
        i_f_filename: `2023-11-28 10-52-05 ${TestDefaultTitle} [DJI_20231128_105205_30].jpg`
      }
    },
    { type: FilePicture }
  );
});

await test.todo(source + ": video", async function (_t) {
  //   await t.test("should parse", () => {
  //     filenameIsA("20211225_202302", "screen", "2021-12-25 20-23-02", {
  //       title: "",
  //       qualif: "20211225_202302"
  //     });
  //   });
  //
  //   await fromTestSuite(t, path.join(source, "20211225_202302.mp4"), {
  //     type: FileMovieUTC,
  //     current: {
  //       // The image is 20:23:04
  //       // Exif:
  //       //   "CreateDate": "2021:12:25 19:23:06",
  //       i_f_title: "",
  //       i_f_time: "2021-12-25 20-23-02",
  //       i_fe_time: "2021:12:25 19:23:06"
  //     },
  //     expected: {
  //       i_f_title: TestDefaultTitle,
  //       i_f_time: "2021-12-25 20-23-06",
  //       i_f_filename: `2021-12-25 20-23-06 ${TestDefaultTitle} [20211225_202302].mp4`
  //     }
  //   });
});
