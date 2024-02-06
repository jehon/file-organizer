import { pad } from "../helpers/string-helpers";
import { Equalable } from "./equalable";

export class GenericTime extends Equalable {
  static EMPTY_MESSAGE = "<empty-generic-time>";
  static TZ_DEFAULT = "Europe/Brussels";
  static TZ_UTC = "UTC";

  /**************
   *
   * Factories
   *
   */

  static empty(): GenericTime {
    return new GenericTime({});
  }

  static from2x3String(str: string, separator: string = "-"): GenericTime {
    if (str == "") {
      return this.empty();
    }
    const parsed = str
      .split(new RegExp(`[ ${separator}]`))
      .map((v) => parseInt(v));
    return new GenericTime({
      year: parsed[0],
      month: parsed[1],
      day: parsed[2],
      hour: parsed[3],
      minute: parsed[4],
      second: parsed[5]
    });
  }

  static fromDate(date: Date): GenericTime {
    return new GenericTime({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    });
  }

  static fromParts(
    year?: number,
    month?: number,
    day?: number,
    hour?: number,
    minute?: number,
    second?: number
  ) {
    return new GenericTime({ year, month, day, hour, minute, second });
  }

  static fromRange(yearMin: number, yearMax: number): GenericTime {
    const gt = new GenericTime({ yearMin, yearMax });
    return gt;
  }

  static fromYear(year: number) {
    return new GenericTime({ year });
  }

  static fromYearMonth(year: number, month: number) {
    return new GenericTime({ year, month });
  }

  /**************
   *
   * Class
   *
   */
  #year?: number;
  #month?: number;
  #day?: number;
  #hour?: number;
  #minute?: number;
  #second?: number;

  #yearMin?: number;
  #yearMax?: number;

  private constructor(data: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    yearMin?: number;
    yearMax?: number;
  }) {
    super();

    this.#year = data.year;
    this.#month = data.month;
    this.#day = data.day;
    this.#hour = data.hour;
    this.#minute = data.minute;
    this.#second = data.second;
    this.#yearMin = data.yearMin;
    this.#yearMax = data.yearMax;
    this._normalize();
    Object.freeze(this);
  }

  toString() {
    if (this.isEmpty()) {
      return GenericTime.EMPTY_MESSAGE;
    }
    return this.to2x3StringForHuman();
  }

  equals(gt: GenericTime): boolean {
    return this.to2x3StringForHuman() == gt.to2x3StringForHuman();
  }

  isDateTime() {
    return this.#year != undefined;
  }

  isDateTimeFull() {
    return this.isDateTime() && this.#second !== undefined;
  }

  isRange() {
    return !this.isDateTime() && this.#yearMin !== undefined;
  }

  isEmpty() {
    return !this.isRange() && !this.isDateTime();
  }

  _normalize(): this {
    if (this.#yearMin !== undefined) {
      // year range
      this.#year = undefined;
      this.#month = undefined;
      this.#day = undefined;
      this.#hour = undefined;
      this.#minute = undefined;
      this.#second = undefined;
    } else {
      this.#yearMin = undefined;
      this.#yearMax = undefined;

      if (!this.#hour && !this.#minute && !this.#second) {
        // xx-xx-xx //-//-// => day precision
        this.#hour = undefined;
        this.#minute = undefined;
        this.#second = undefined;

        if (!this.#month && !this.#day) {
          // Legacy Exif tag
          this.#month = undefined;
          this.#day = undefined;

          if (!this.#year) {
            // Allow parsing EXIF_EMPTY
            this.#year = undefined;
          }
        }
      } else if (
        this.#month == 1 &&
        this.#day == 1 &&
        this.#hour == 1 &&
        this.#minute == 1 &&
        this.#second == 1
      ) {
        // xx-01-01 01-01-01 => year precision]
        this.#month = undefined;
        this.#day = undefined;
        this.#hour = undefined;
        this.#minute = undefined;
        this.#second = undefined;
      } else if (
        // xx-xx-02 02-02-02 => month precision]
        this.#day == 2 &&
        this.#hour == 2 &&
        this.#minute == 2 &&
        this.#second == 2
      ) {
        this.#day = undefined;
        this.#hour = undefined;
        this.#minute = undefined;
        this.#second = undefined;
      }
    }
    return this;
  }

  toJSON() {
    return {
      isEmpty: this.isEmpty(),
      isRange: this.isRange(),
      isDateTime: this.isDateTime(),
      year: this.#year,
      month: this.#month,
      day: this.#day,
      hour: this.#hour,
      minute: this.#minute,
      second: this.#second,
      yearMin: this.#yearMin,
      yearMax: this.#yearMax
    };
  }

  to2x3String(separator: string = "-"): string {
    if (this.isRange()) {
      return [this.#yearMin, this.#yearMax].join(separator);
    }

    if (this.isEmpty()) {
      return [
        ["0000", "00", "00"].join(separator),
        ["00", "00", "00"].join(separator)
      ].join(" ");
    }

    if (this.#month == undefined) {
      return [
        [pad(this.#year, 4), "01", "01"].join(separator),
        ["01", "01", "01"].join(separator)
      ].join(" ");
    }

    if (this.#day == undefined) {
      return [
        [pad(this.#year, 4), pad(this.#month, 2), "02"].join(separator),
        ["02", "02", "02"].join(separator)
      ].join(" ");
    }

    if (this.#hour == undefined) {
      return [
        [pad(this.#year, 4), pad(this.#month, 2), pad(this.#day, 2)].join(
          separator
        ),
        ["00", "00", "00"].join(separator)
      ].join(" ");
    }

    return [
      [pad(this.#year, 4), pad(this.#month, 2), pad(this.#day, 2)].join(
        separator
      ),
      [pad(this.#hour, 2), pad(this.#minute, 2), pad(this.#second, 2)].join(
        separator
      )
    ]
      .join(" ")
      .trim();
  }

  to2x3StringForHuman(): string {
    return this.to2x3String()
      .replace("0000-00-00 00-00-00", "")
      .replace("-01-01 01-01-01", "")
      .replace("-02 02-02-02", "")
      .replace(" 00-00-00", "")
      .trim();
  }

  toTemporalPlainYearMonth(large: boolean = false): PlainYearMonth {
    if (!this.#year || (!large && !this.#month)) {
      throw new Error(
        "Impossible to get Temporal.PlainYearMonth on non-date object " +
          this.toString()
      );
    }
    return new Temporal.PlainYearMonth(this.#year, this.#month ?? 1);
  }

  isAfter(ts: GenericTime): boolean {
    if (ts.isEmpty()) {
      return true;
    }

    if (this.isEmpty()) {
      return false;
    }

    if (this.isRange()) {
      if (ts.isRange()) {
        return this.#yearMin! > ts.#yearMin!;
      } else {
        return this.#year! > ts.#year!;
      }
    } else if (ts.isRange()) {
      return this.#year! > ts.#yearMin!;
    }

    return this.to2x3String() > ts.to2x3String();
  }

  isMorePreciseThan(
    gtLarger: GenericTime,
    allowMonthBeforeOrAfter: boolean = false
  ): boolean {
    if (gtLarger.isEmpty()) {
      // Ok even if this is Empty
      return true;
    }

    if (this.isEmpty()) {
      return false;
    }

    if (gtLarger.isRange()) {
      if (
        this.#year! >= gtLarger.#yearMin! &&
        this.#year! <= gtLarger.#yearMax!
      ) {
        return true;
      }
    }

    if (this.to2x3StringForHuman().startsWith(gtLarger.to2x3StringForHuman())) {
      return true;
    }

    if (allowMonthBeforeOrAfter) {
      const justBefore = gtLarger
        .toTemporalPlainYearMonth(true)
        .add({ months: -1 });
      if (
        this.isMorePreciseThan(
          GenericTime.fromYearMonth(justBefore.year, justBefore.month)
        )
      ) {
        return true;
      }
      const justAfter = gtLarger
        .toTemporalPlainYearMonth(true)
        .add({ months: 1 });
      if (
        this.isMorePreciseThan(
          GenericTime.fromYearMonth(justAfter.year, justAfter.month)
        )
      ) {
        return true;
      }
    }

    return false;
  }

  convertTimezone(currentTZ: string, targetTZ: string): GenericTime {
    if (!this.isDateTimeFull()) {
      return this;
    }

    if (!currentTZ) {
      currentTZ = GenericTime.TZ_DEFAULT;
    }

    if (!targetTZ) {
      targetTZ = GenericTime.TZ_DEFAULT;
    }

    const inCurrentTZ = new Temporal.ZonedDateTime(BigInt(0), currentTZ)
      .withPlainDate({
        year: this.#year!,
        month: this.#month!,
        day: this.#day!
      })
      .withPlainTime({
        hour: this.#hour!,
        minute: this.#minute!,
        second: this.#second!
      });

    const inTargetTZ = inCurrentTZ.withTimeZone(targetTZ);
    return GenericTime.fromParts(
      inTargetTZ.year,
      inTargetTZ.month,
      inTargetTZ.day,
      inTargetTZ.hour,
      inTargetTZ.minute,
      inTargetTZ.second
    );
  }
}
