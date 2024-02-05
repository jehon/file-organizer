import path from "node:path";

import test from "node:test";
import FilePicture from "../../src/file-types/file-picture";
import fromTestSuite from "./test-source-helpers";

const source = "web";

await test(source + ": image", async function (t) {
  await fromTestSuite(
    t,
    path.join(source, "2021-02-03.png"),
    {
      initial: {},
      current: {
        i_f_time: "2021-02-03"
      },
      expected: {
        i_f_time: "2021-02-03",
        i_f_filename: "2021-02-03 Web.jpg"
      }
    },
    { type: FilePicture }
  );
});
