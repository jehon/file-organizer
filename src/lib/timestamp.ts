import { GenericTime } from "./generic-time";

export type TimeInfo = {
  type: string;
  title?: string;
  qualif?: string;
  time: GenericTime;
};

/**
 * Remove the names from a regexp
 */
function removeNames(regExp: RegExp): string {
  return regExp.source.replace(/\?<[^>]+>/g, "");
}

const ts =
  /(?<year>[0-9][0-9][0-9][0-9])([-:](?<month>[0-1][0-9])([-:](?<day>[0-3][0-9]))?)?( (?<hour>[0-2][0-9])[:-](?<minute>[0-5][0-9])([:-](?<second>[0-5][0-9])(?<timezone>[+-]\d\d:\d\d)?))?/;

const yearUnammed = /[0-9][0-9][0-9][0-9]/;

//
// The matchers:
//

const tsOnly = /^${ts.source}$/;

const raw8_3 = new RegExp("^(?<qualif>[A-Z0-9_]{8})$");

export const final = new RegExp(
  `^${ts.source}( (?<title>[^[]*))?( \\[(?<qualif>.+)\\])?$`
);

const androidCamera =
  /^(?<qualif>(VID|IMG)_(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2}))$/;

/* ex: IMG-20180915-WA0001 */
const androidWhatsApp =
  /^(?<qualif>(VID|IMG)-(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})-WA[0-9]+)$/;

const androidDJI =
  /^(?<qualif>(DJI)_(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2})_[0-9]{2})$/;

/* ex: signal-2022-04-07-16-45-43-559 */
const androidSignal =
  /(?<qualif>signal-(?<year>[0-9][0-9][0-9][0-9])-(?<month>[0-1][0-9])-(?<day>[0-3][0-9])-(?<hour>[0-2][0-9])-(?<minute>[0-5][0-9])-(?<second>[0-5][0-9])-[0-9]{3})$/;

const screen =
  /^(?<qualif>(?<year>(19|20)[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2}))(?<title>.*)?$/;

const yearRange = new RegExp(
  `^(?<yearMin>${yearUnammed.source})-(?<yearMax>${yearUnammed.source})( (?<title>[^[]+))?( \\[(?<qualif>.+)\\])?$`
);

const minimal = new RegExp(
  `^(?!${ts.source})(?<title>(?!.* ${removeNames(
    ts
  )})[^[]+)( \\[(?<qualif>.+)\\])?$`
);

const invalid = /^(?<title>.*$)/; // Fallback

const matchers: Record<string, RegExp> = {
  raw8_3,
  tsOnly,
  final,
  androidCamera,
  androidDJI,
  androidWhatsApp,
  androidSignal,
  screen,
  yearRange,
  minimal,

  invalid // Fallback
};

export function parseFilename(str: string): TimeInfo {
  const res = {
    string: str,
    title: "",
    qualif: "",
    time: GenericTime.empty(),
    type: "invalid"
  };

  if (!str) {
    return res;
  }

  for (const k of Object.keys(matchers)) {
    const re = new RegExp(matchers[k], "gm");
    const matches = re.exec(str);
    if (matches && matches.groups) {
      res.type = k;

      const parsed = {
        year: Number(matches.groups.year ?? 0),
        month: Number(matches.groups.month ?? -1), // -> YYYY:01:01 01:01:01
        day: Number(matches.groups.day ?? -1), // -> YYYY:MM:02 02:02:02
        hour: Number(matches.groups.hour ?? 0),
        minute: Number(matches.groups.minute ?? 0),
        second: Number(matches.groups.second ?? 0),

        qualif: (matches.groups.qualif ?? "").trim(), // in the tag, the filename
        title: (matches.groups.title ?? "").trim(), // in the tag, the rest (out of the filename)

        yearMin: Number(matches.groups.yearMin ?? 0),
        yearMax: Number(matches.groups.yearMax ?? 0)
      };

      /** @type {string|number} */
      res.qualif = "" + parsed.qualif;
      res.title = "" + parsed.title;

      if (res.type == "yearRange") {
        res.time = GenericTime.fromRange(parsed.yearMin, parsed.yearMax);
        break;
      }

      if (parsed.year > 0) {
        if (
          parsed.month < 1 ||
          // We hardcode a limit where the day has no meaning...
          (parsed.year < 1998 &&
            parsed.month < 2 &&
            parsed.day < 2 &&
            parsed.hour < 1 &&
            parsed.minute < 1 &&
            parsed.second < 1)
        ) {
          // Year only
          res.time = GenericTime.fromYear(parsed.year);
          break;
        }

        if (
          parsed.day < 0 ||
          (parsed.year < 1998 &&
            parsed.day < 2 &&
            parsed.hour < 1 &&
            parsed.minute < 1 &&
            parsed.second < 1)
        ) {
          // Year-month only
          res.time = GenericTime.fromYearMonth(parsed.year, parsed.month);
          break;
        }
        res.time = GenericTime.fromParts(
          parsed.year,
          parsed.month,
          parsed.day,
          parsed.hour,
          parsed.minute,
          parsed.second
        );
        break;
      }

      res.time = GenericTime.empty();
      break;
    }
  }

  return res;
}

// For testing purposes
export const regexps = { androidCamera };
