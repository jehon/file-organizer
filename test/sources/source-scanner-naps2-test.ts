import path from "node:path";
import test from "node:test";

import FilePicture from "../../src/file-types/file-picture";
import fromTestSuite, { filenameIsA } from "./test-source-helpers";

const source = "scanner-naps2";

await test("should parse", () => {
  filenameIsA("2021-12 scanned", "final", "2021-12", {
    title: "scanned",
    qualif: ""
  });
});

await test(source + ": image", async function (t) {
  await fromTestSuite(
    t,
    path.join(source, "2021-12 scanned.jpg"),
    {
      initial: {},
      current: {
        i_f_title: "scanned",
        i_f_time: "2021-12"
      },
      expected: {
        i_f_title: "Scanned",
        i_f_time: "2021-12",
        i_f_filename: "2021-12 Scanned.jpg"
      }
    },
    { type: FilePicture, mtime: "2019-01-02 03:04:05" }
  );
});
