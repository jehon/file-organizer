import tzlookup from "tz-lookup";

//
// if you create a Date object in valid ISO date format (YYYY-MM-DD), it will default to UTC instead of defaulting to the browser’s time zone.
//

//
// Hypothesis: the timestamp string always refer to the LOCAL TIME of the element
//   - in the filename, the timestamp is local
//   - a picture? the local time at the place where the picture was taken (taken into account the timezone)
//
// The timestamp is always canonized
//

/******************************
 *
 * GPS Utilities
 *
 */

// Used in EXIF
export function coordonate2tz(GPS: string): string {
  const p = function (str: string) {
    const parser =
      /(?<v1>\d+) deg (?<v2>\d+)' (?<v3>\d+)\.(?<v4>\d+)" (?<orien>(N|S|E|O))/;
    const c = str.match(parser);
    if (c) {
      return (
        (parseInt(c.groups?.v1 ?? "") +
          parseInt(c.groups?.v2 ?? "") / 60 +
          (parseInt(c.groups?.v3 ?? "") + parseInt(c.groups?.v4 ?? "") / 100) /
            3600) *
        (c?.groups?.orien == "N" || c?.groups?.orien == "E" ? 1 : -1)
      );
    }
    return 0;
  };

  const coord = GPS.split(",");

  const lat = p(coord[0]);
  const long = p(coord[1]);

  return tzlookup(lat, long);
}

// Used in tui-helper
export function secs2Time(s: number): string {
  const h = Math.floor(s / 3600);
  s = s - h * 60 * 60;
  const m = Math.floor(s / 60);
  s = s - m * 60;

  let res = "";
  if (h > 0) {
    res += (h + "").padStart(2, " ") + ":";
  }
  res += `${("" + m).padStart(2, "0")}:${("" + Math.ceil(s)).padStart(2, "0")}`;
  return res;
}
