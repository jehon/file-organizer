import path from "node:path";
import test from "node:test";
import FileMovieUTC from "../../src/file-types/file-movie-utc";
import FilePicture from "../../src/file-types/file-picture";
import fromTestSuite, {
  TestDefaultTitle,
  filenameIsA
} from "./test-source-helpers";

const source = "android-signal";

await test(source + ": image", async function (t) {
  await t.test("should parse", () => {
    filenameIsA(
      "signal-2022-04-07-16-45-43-559",
      "androidSignal",
      "2022-04-07 16-45-43",
      {
        title: "",
        qualif: "signal-2022-04-07-16-45-43-559"
      }
    );
  });

  await fromTestSuite(
    t,
    path.join(source, "signal-2022-04-07-16-45-43-559.jpg"),
    {
      initial: {
        i_f_time: "2022-04-07 16-45-43"
      },
      current: {
        i_f_title: "",
        // The image is 2022-04-07 16-45-41
        i_f_time: "2022-04-07 16-45-43"
      },
      expected: {
        i_f_title: TestDefaultTitle,
        i_f_time: "2022-04-07 16-45-43",
        i_f_filename: `2022-04-07 16-45-43 ${TestDefaultTitle} [signal-2022-04-07-16-45-43-559].jpg`
      }
    },
    { type: FilePicture }
  );
});

await test(source + ": video", async function (t) {
  await t.test("should parse", () => {
    filenameIsA(
      "signal-2022-04-22-12-25-56-329",
      "androidSignal",
      "2022-04-22 12-25-56",
      {
        title: "",
        qualif: "signal-2022-04-22-12-25-56-329"
      }
    );
  });

  await fromTestSuite(
    t,
    path.join(source, "signal-2022-04-22-12-25-56-329.mp4"),
    {
      initial: {
        i_f_time: "2022-04-22 12-25-56",
        // The image is 2022-04-22 12:25:32
        // The exif is: "MediaModifyDate": "2022:04:22 10:25:36"
        i_fe_time: "2022:04:22 10:25:36"
      },
      current: {
        i_f_title: "",
        i_f_time: "2022-04-22 12-25-56",
        i_fe_time: "2022:04:22 10:25:36"
      },
      expected: {
        i_f_title: TestDefaultTitle,
        i_f_time: "2022-04-22 12-25-36",
        i_f_filename: `2022-04-22 12-25-36 ${TestDefaultTitle} [signal-2022-04-22-12-25-56-329].mp4`
      }
    },
    { type: FileMovieUTC }
  );
});
