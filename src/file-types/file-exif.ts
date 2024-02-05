import debug from "debug";
import { ExecFileSyncException, myExecFileSync } from "../helpers/exec-helper";
import { coordonate2tz } from "../helpers/time-helpers";
import { GenericTime } from "../lib/generic-time";
import Value, { Flavor, currentCalculatedValueFactory } from "../lib/value";
import FileFolder from "./file-folder";
import FileTimed from "./file-timed";

//
// Exif File

//
// The timestamp string must be stored in the application in the local time of the element
//    It will be translated from/to UTC onRead and onWrite when necessary
//

/**
 * Exif executable
 */
const EXIFTOOL = "exiftool";

if (!process.env.TZ) {
  process.stderr.write("Not TZ found\n");
  process.exit(1);
}

const debugExif = debug("exiftool");

try {
  myExecFileSync(EXIFTOOL, ["-v"]);
} catch (_e) {
  console.error(`Command exiftool (${EXIFTOOL}) not found in path`);
  process.exit(145);
}

export const EXIF_EMPTY = "0000:00:00 00:00:00";

/************************************************
 *
 * Conversion functions
 *
 */

function translateRotation(rotation: string = ""): number {
  switch (rotation) {
    // What is the top-left corner?
    case "Rotate 270 CW":
    case "left, bottom":
      // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_8.jpg
      return 270;

    case "Rotate 90 CW":
    case "right, top":
      // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_6.jpg
      return 90;

    case "Rotate 180":
    case "bottom, right":
      // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_3.jpg
      return 180;

    // No information given
    case undefined:
    case "Unknown (0)":
    case "":
    case "(0)":
    case "top, left":
    case "Horizontal (normal)":
      return 0;

    default:
      throw new Error(
        `exifReadRotation: could not understand value: ${rotation}`
      );
  }
}

/********************************************************
 *
 * Execution
 *
 */

/**
 * Limited //isme on exifExecLimiter
 *
 * @param {Array<string>} params to be passed to EXIFTOOL
 * @returns {string} the result of the command
 */
function runExif(params: string[]): string {
  try {
    return myExecFileSync(EXIFTOOL, [...params], { hideError: true }) ?? "";
  } catch (e) {
    const error = e as ExecFileSyncException;
    switch (error.status) {
      // case 0: // ok, continue
      //   return error.stdout ?? "";
      // case 1:   // The file contains data of an unknown image type
      case 253: // No exif data found in file
        return "";
      case 255: // File does not exists
        return "";
      default:
        console.error(`
*********
*** runExif process: exit_code=${error.status} signal=${error.signal}
*** ${EXIFTOOL} '${params.join("' '")}'
*** ${error.stderr}
*********
`);
        throw new Error("runExif failed");
    }
  }
}

export default class FileExif extends FileTimed {
  i_fe_valid: Value<boolean>;
  i_fe_time: Value<string>; // exiv timestamp (yyyy:mm:dd hh:mm:ss)
  i_fe_title: Value<string>;
  i_fe_synced: Value<boolean>;
  i_fe_tz: Value<string>;
  i_fe_orientation: Value<number>;
  i_fe_clean_tags: Value<string[]>;

  rawExifData: Record<string, string>;
  parsedExifData: {
    valid: boolean;
    title: string;
    ts: string;
    timezone: string;
    orientation: number;
    GPSPosition?: string;
  };

  get EXIF_TS() {
    return "DateTimeOriginal";
  }

  /*
        Exif Fields used in
        - In DigiKam:
            - Title
            - Description

        - In Win10 Explorer:
            - Title
            - Description
            - Subject <= ImageDescription
    */
  get EXIF_TITLE() {
    return "Title";
  }

  get EXIF_TS_STORED_IN_UTC() {
    return false;
  }

  constructor(filename: string, parent: FileFolder) {
    super(filename, parent);

    this.rawExifData = {};
    this.parsedExifData = {
      valid: false,
      title: "",
      ts: EXIF_EMPTY,
      timezone: "",
      orientation: translateRotation()
    };

    try {
      this.rawExifData = (
        JSON.parse(
          runExif([
            "-j", // Output as JSON
            "-m", // Ignore minor errors and warnings
            this.currentFilepath
          ])
        ) as Record<string, string>[]
      )[0];

      this.parsedExifData.valid = true;
      if (this.rawExifData[this.EXIF_TITLE]) {
        this.parsedExifData.title = this.rawExifData[this.EXIF_TITLE];
      }

      if (this.rawExifData[this.EXIF_TS]) {
        this.parsedExifData.ts = this.rawExifData[this.EXIF_TS];
      }

      this.parsedExifData.orientation = translateRotation(
        this.rawExifData.Orientation
      );

      if (this.rawExifData.GPSPosition) {
        this.parsedExifData.timezone = coordonate2tz(
          this.rawExifData.GPSPosition
        );
      }
    } catch (_e) {
      // Already handled
    }

    this.i_fe_valid = currentCalculatedValueFactory(
      "Exif are valid",
      () => this.parsedExifData.valid
    );

    // If the data is stored in UTC and if we have a timezone,
    // translate the date/time into local time (of the timezone)
    this.i_fe_tz = new Value(this.parsedExifData.timezone);
    this.i_fe_orientation = new Value(this.parsedExifData.orientation);

    this.i_fe_time = new Value(
      this.parsedExifData.ts
    ).withExpectedCalculated(() => {
      const ts = this.i_f_time["expected"];
      if (ts.isEmpty()) {
        return EXIF_EMPTY;
      }
      let finalTS = ts;

      if (finalTS.isDateTime() && this.EXIF_TS_STORED_IN_UTC) {
        // Convert from localTime to UTC
        finalTS = finalTS.convertTimezone(
          this.i_fe_tz.expected,
          GenericTime.TZ_UTC
        );
      }
      return finalTS.to2x3String(":");
    }, [this.i_f_time]);

    this.i_fe_title = new Value(
      this.parsedExifData.title
    ).withExpectedCalculated(
      () => this.i_f_title["expected"],
      [this.i_f_title]
    );

    this.i_fe_clean_tags = new Value<string[]>([]);

    this.i_fe_synced = currentCalculatedValueFactory(
      "Data is written",
      () => this.i_fe_time.isDone() && this.i_fe_title.isDone()
    ).withFix(
      (v) => {
        const cmdLine = [
          "-overwrite_original",
          "-m" // Ignore minor errors and warnings
        ];

        if (!this.i_fe_time.isDone()) {
          cmdLine.push(`-${this.EXIF_TS}=${this.i_fe_time.expected}`);
        }

        if (!this.i_fe_title.isDone()) {
          cmdLine.push(`-${this.EXIF_TITLE}=${this.i_fe_title.expected}`);
        }

        for (const k of this.i_fe_clean_tags.expected) {
          cmdLine.push(`-${k}=`);
        }

        cmdLine.push(this.currentFilepath);

        debugExif("exifWrite:", cmdLine.join(" # "));
        runExif(cmdLine);

        v.fixed();
      },
      [this.i_fe_time, this.i_fe_title, this.i_fe_clean_tags]
    );

    // Initialize the global values if exif data present
    if (this.i_fe_time.initial && this.i_fe_time.initial != EXIF_EMPTY) {
      this.i_f_time.expect(this.getTS(Flavor.initial), "Exif timestamp");
    }

    if (this.i_fe_title.initial) {
      this.i_f_title.expect(this.i_fe_title.initial, "Exif title");
    }

    this.i_fe_orientation.expect(0, "FileExiv: orientation to top");

    return this;
  }

  /**
   * Get the exif as timestamp (local timezone) (reading)
   *
   *   When reading the exif, it is sometimes in UTC, and we treat only Local Time timestamps!
   */
  getTS(flavor: Flavor, exifTs = this.i_fe_time[flavor]): GenericTime {
    const exifTsGT = GenericTime.from2x3String(exifTs, ":");

    if (exifTsGT.isEmpty()) {
      return GenericTime.empty();
    }

    if (!exifTsGT.isDateTimeFull()) {
      return exifTsGT;
    }

    return this.EXIF_TS_STORED_IN_UTC
      ? exifTsGT.convertTimezone(GenericTime.TZ_UTC, this.i_fe_tz[flavor])
      : exifTsGT;
  }
}
