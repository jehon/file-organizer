import path from "node:path";
import test from "node:test";

import FileMovie from "../../src/file-types/file-movie";
import FilePicture from "../../src/file-types/file-picture";
import { GenericTime } from "../../src/lib/generic-time";
import fromTestSuite, {
  TestDefaultTitle,
  filenameIsA
} from "./test-source-helpers";

const source = "camera-canon";

//
// There is a 23 seconds difference between the camera and the real time
//   because the camera is set manually
//

await test(source + ": image", async function (t) {
  await t.test("should parse", () => {
    filenameIsA("DSC_5747", "raw8_3", "", {
      title: "",
      qualif: "DSC_5747"
    });
  });

  await fromTestSuite(
    t,
    path.join(source, "DSC_5747.JPG"),
    {
      initial: {},
      current: {
        i_f_title: "",
        i_f_time: GenericTime.EMPTY_MESSAGE
      },
      expected: {
        i_f_title: TestDefaultTitle,
        i_f_time: "2021-12-25 20-22-23",
        i_f_filename: `2021-12-25 20-22-23 ${TestDefaultTitle} [DSC_5747].jpg`
      }
    },
    { type: FilePicture }
  );
});

await test(source + ": video", async function (t) {
  await t.test("should parse", () => {
    filenameIsA("DSC_5749", "raw8_3", "", {
      title: "",
      qualif: "DSC_5749"
    });
  });

  await fromTestSuite(
    t,
    path.join(source, "DSC_5749.MOV"),
    {
      initial: {},
      current: {
        i_f_title: "",
        i_f_time: GenericTime.EMPTY_MESSAGE
      },
      expected: {
        i_f_title: TestDefaultTitle,
        // The image is 2021-12-25 20:22:24 (winter time)
        i_f_time: "2021-12-25 20-22-48",
        i_f_filename: `2021-12-25 20-22-48 ${TestDefaultTitle} [DSC_5749].mov`
      }
    },
    { type: FileMovie }
  );
});
