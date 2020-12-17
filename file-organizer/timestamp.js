
const tzlookup = require('tz-lookup');

// TODO: remove momentjs
const moment = require('moment');
require('moment-timezone');

/**
 * @param {object} object where to look for the key
 * @param {string} key is a key
 * @param {*} _default when k is not in object
 * @returns {*} on object[key] or default
 */
function parseInfo(object, key, _default) {
    if (key in object && object[key]) {
        const val = +object[key];
        if (isNaN(val)) {
            return object[key].trim();
        }
        return val;
    }
    return _default;
}

/**
 * Remove the names from a regexp
 *
 * @param {RegExp} regExp to be handled
 * @returns {string} the regexp but without group names
 */
function removeNames(regExp) {
    let str = regExp.source;
    return str.replace(/\?<[^>]+>/g, '');
}

const ts = /(?<year>[0-9][0-9][0-9][0-9])([-:](?<month>[0-1][0-9])([-:](?<day>[0-3][0-9]))?)?( (?<hour>[0-2][0-9])[:-](?<minute>[0-5][0-9])([:-](?<second>[0-5][0-9])(?<timezone>[+-]\d\d:\d\d)?))?/;

const yearUnammed = /[0-9][0-9][0-9][0-9]/;

//
// The matchers:
//

const tsOnly = /^${ts.source}$/;

const raw8_3 = new RegExp('^(?<qualif>[A-Z0-9_]{8})$');

const final = new RegExp(`^${ts.source}( (?<title>[^[]*))?( \\[(?<qualif>.+)\\])?$`);

const android = /^(?<qualif>(VID|IMG)_(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2}))$/;

/* ex: IMG-20180915-WA0001 */
const whatsapp = /^(?<qualif>(VID|IMG)-(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})-WA[0-9]+)$/;

const screen = /^(?<qualif>(?<year>(19|20)[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2}))(?<title>.*)?$/;

const yearRange = new RegExp(`^(?<yearMin>${yearUnammed.source})-(?<yearMax>${yearUnammed.source})( (?<title>.*))?$`);

const minimal = new RegExp(`^(?!${ts.source})(?<title>(?!.* ${removeNames(ts)})[^[]+)( \\[(?<qualif>.+)\\])?$`);

const invalid = /^(?<title>.*$)/; // Fallback

const matchers = {
    raw8_3,
    tsOnly,
    final,
    android,
    whatsapp,
    screen,
    yearRange,
    minimal,

    invalid // Fallback
};

exports.defaultValues = {
    year: 0,
    month: -1, // -> YYYY:01:01 01:01:01
    day: -1, // -> YYYY:MM:02 02:02:02
    hour: 0,
    minute: 0,
    second: 0,

    qualif: '', // in the tag, the filename
    title: '',  // in the tag, the rest (out of the filename)

    yearMin: 0,
    yearMax: 0
};

const EMPTY_EXIF = '0000:00:00 00:00:00';

class Timestamp {
    constructor(str = '', tz = false) {
        const parsed = Object.assign({}, exports.defaultValues);

        this.string = str;

        for (const k of Object.keys(matchers)) {
            const re = new RegExp(matchers[k], 'gm');
            const matches = re.exec(str);
            if (matches && matches.groups) {
                this.type = k;

                for (const m of Object.keys(matches.groups)) {
                    if (m[0] == '_') {
                        continue;
                    }
                    parsed[m] = parseInfo(matches.groups, m, parsed[m]);
                }
                break;
            }
        }

        /** @type {string|number} */
        this.qualif = parsed.qualif;
        this.title = parsed.title;
        this.yearMin = parsed.yearMin;
        this.yearMax = parsed.yearMax;

        if (this.isRange()) {
            this.moment = null;
        } else {
            this.moment = null;
            if (parsed.year < 1) {
                // Nothing to do
                this.moment = null;
            } else {
                // // We hardcode a limit where the day has no meaning...
                if (parsed.month < 1
                    || (parsed.year < 1998 && parsed.month < 2 && parsed.day < 2 && parsed.hour < 1 && parsed.minute < 1 && parsed.second < 1)
                ) {
                    this.moment = moment.utc([parsed.year]);
                    this.yearOnly();
                } else {
                    if (parsed.day < 0
                        || (parsed.year < 1998 && parsed.day < 2 && parsed.hour < 1 && parsed.minute < 1 && parsed.second < 1)
                    ) {
                        this.moment = moment.utc([parsed.year, parsed.month - 1]);
                        this.yearMonthOnly();
                    } else {
                        // Normal case
                        this.moment = moment.utc([parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute, parsed.second]);
                        if (tz) {
                            this.utcToTimezone(tz);
                        }
                    }
                }

            }
        }

        return;
    }

    clone() {
        return Object.assign(new Timestamp(), this, {
            moment: (this.moment ? this.moment.clone() : null)
        });
    }

    /**
     *
     * @param {Timestamp} b to be compared to
     * @returns {boolean} if equals
     */
    equals(b) {
        return this.humanReadable() == b.humanReadable();
    }

    yearMonthOnly() {
        this.moment.date(2); // day of month
        this.moment.hour(2);
        this.moment.minute(2);
        this.moment.second(2);
    }

    yearOnly() {
        this.moment.month(0); // 0 based -> eq "1"
        this.moment.date(1);  // day of month
        this.moment.hour(1);
        this.moment.minute(1);
        this.moment.second(1);
    }

    isRange() {
        return this.yearMin > 0 && this.yearMax > 0;
    }

    isTextOnly() {
        return !this.isRange() && !this.moment;
    }

    isTimestamped() {
        return this.moment != null;
    }

    isYearOnly() {
        return this.isTimestamped() && this.humanReadable().length == 4;
    }

    utcToTimezone(tz) {
        if (this.isTimestamped()) {
            this.moment = this.moment.tz(tz); // true: force to keep the initial value, false: convert
        }
    }

    humanReadable() {
        if (!this.isTimestamped()) {
            return '';
        }

        return this.moment.format('YYYY-MM-DD HH-mm-ss')
            .replace('-01-01 01-01-01', '')
            .replace('-02 02-02-02', '')
            .replace(' 00-00-00', '');
    }

    /**
     * Instead is internally used in file-exif
     *
     * @deprecated
     *
     * @returns {string} formatted for Exif
     */
    exif() {
        if (!this.isTimestamped()) {
            return EMPTY_EXIF;
        }
        const utc = this.moment.clone().utc();
        return utc.format('YYYY:MM:DD HH:mm:ss');
    }

    // match test if the timestamp match against (larger) ts
    match(larger) {
        if (this.isTextOnly()) {
            return true;
        }

        if (larger.isRange()) {
            return this.moment.year() >= larger.yearMin && this.moment.year() <= larger.yearMax;
        }

        if (this.humanReadable().startsWith(larger.humanReadable())) {
            return true;
        }

        return false;
    }

    // MatchExact test if two TS are exactly the same
    matchExact(t2) {
        if (!this.match(t2)) {
            return false;
        }
        return (this.humanReadable() == t2.humanReadable());
    }

    // MatchAgainstLithe test if the timestamp match against (larger) ts, but by closest month
    matchLithe(larger) {
        if (this.match(larger)) {
            return true;
        }
        if (larger.isRange()) {
            return false;
        }

        { // By same month
            const ref = larger.clone();
            ref.yearMonthOnly();
            if (this.match(ref)) {
                return true;
            }
        }
        { // By month before
            const ref = larger.clone();
            if (ref.isYearOnly()) {
                // Match by year
                ref.moment.subtract(1, 'year');
                ref.moment.month(11);
            } else {
                ref.moment.subtract(1, 'month');
            }
            ref.yearMonthOnly();
            if (this.match(ref)) {
                return true;
            }
        }
        { // By month after
            const ref = larger.clone();
            if (ref.isYearOnly()) {
                // Match by year
                ref.moment.add(1, 'year');
                ref.moment.month(0);
            } else {
                ref.moment.add(1, 'month');
            }
            ref.yearMonthOnly();
            if (this.match(ref)) {
                return true;
            }
        }
        return false;
    }

}

exports.tsFromString = function (str) {
    return new Timestamp(str);
};

exports.tsFromExif = function (str, tz = false) {
    return new Timestamp(str, tz);
};

exports.Timestamp = Timestamp;
exports.regexps = {
    android
};

exports.tzFromGPS = function (GPS) {
    const p = function (str) {
        const parser = /(?<v1>\d+) deg (?<v2>\d+)' (?<v3>\d+)\.(?<v4>\d+)" (?<orien>(N|S|E|O))/;
        const c = str.match(parser);
        const val = (parseInt(c.groups.v1)
            + (parseInt(c.groups.v2) / 60)
            + ((parseInt(c.groups.v3) + parseInt(c.groups.v4) / 100) / 3600)
        ) * (c.groups.orien == 'N' || c.groups.orien == 'E' ? 1 : -1);
        return val;
    };

    const coord = GPS.split(',');

    const lat = p(coord[0]);
    const long = p(coord[1]);

    return tzlookup(lat, long);
};

exports.currentTzOffset = function () {
    return moment().utcOffset();
};
