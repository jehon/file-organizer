// Typescript does not support this 2023-12
// FIXME(waiting): use official TestContext definition
// See https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/67127
// See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/test.d.ts#L391
type TestContext = {
  test: (
    title: string,
    testFn?: (t: TestContext) => void | Promise<void>
  ) => Promise<void>;
};

// See https://github.com/js-temporal/temporal-polyfill/blob/main/index.d.ts
// FIXME(waiting): use official Temporal definition
declare const Temporal: {
  Instant: Instant;
  ZonedDateTime: ZonedDateTime;
  PlainDateTime: PlainDateTime;
  PlainYearMonth: PlainYearMonth;
};

// https://tc39.es/proposal-temporal/docs/instant.html
type Instant = {
  new (): Instant;

  toLocaleString: (locale: string) => string;
  toString: () => string;
  toZonedDateTimeISO: (tz: string) => ZonedDateTime;
};

// https://tc39.es/proposal-temporal/docs/zoneddatetime.html
type ZonedDateTime = {
  new (epochNanoseconds: bigint, tz: string): ZonedDateTime;

  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;

  toLocaleString: (locale: string) => string;
  toString: () => string;
  withTimeZone: (tz: string) => ZonedDateTime;
  toPlainDateTime(): () => PlainDateTime;

  withPlainDate: ({
    year,
    month,
    day
  }: {
    year: number;
    month: number;
    day: number;
  }) => ZonedDateTime;
  withPlainTime: ({
    hour,
    minute,
    second
  }: {
    hour: number;
    minute: number;
    second: number;
  }) => ZonedDateTime;
};

// https://tc39.es/proposal-temporal/docs/plaindate.html
type PlainYearMonth = {
  new (isoYear: number, isoMonth: number): PlainYearMonth;

  year: number;
  month: number;

  toString: () => string;
  add(duration: object): PlainYearMonth;
};

// https://tc39.es/proposal-temporal/docs/plaindatetime.html#new-Temporal-PlainDateTime
type PlainDateTime = {
  new (
    isoYear: number,
    isoMonth: number,
    isoDay: number,
    isoHour?: number,
    isoMinute?: number,
    isoSecond?: number
  ): PlainDateTime;

  toDate(): () => Date;
  toZonedDateTime: (tz: string) => ZonedDateTime;
};

// Typescript tip: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
interface Date {
  // https://tc39.es/proposal-temporal/docs/cookbook.html#temporal-types--legacy-date
  // https://tc39.es/proposal-temporal/docs/instant.html#interoperability-with-date
  // toTemporalInstant: () => Instant;
}
