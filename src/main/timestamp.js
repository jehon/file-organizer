
// TODO(timestamp): refactor into string or dates????
// TODO: remove momentjs

import moment from 'moment';
import 'moment-timezone';
import { canonizeTimestamp, isRange } from './time-helpers.js';

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

export const defaultValues = {
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


export default class Timestamp {
    year = 0
    month = -1 // -> YYYY:01:01 01:01:01
    day = -1 // -> YYYY:MM:02 02:02:02
    hour = 0
    minute = 0
    second = 0
    moment = null

    qualif = '' // in the tag, the filename
    title = ''  // in the tag, the rest (out of the filename)

    yearMin = 0
    yearMax = 0

    string = ''
    tz = ''

    constructor(str = '', tz = '') {
        this.string = str;

        if (!str) {
            return;
        }

        for (const k of Object.keys(matchers)) {
            const re = new RegExp(matchers[k], 'gm');
            const matches = re.exec(str);
            if (matches && matches.groups) {
                this.type = k;
                this.store(matches, tz);
                break;
            }
        }
    }

    store(matches, tz = '') {
        const parsed = Object.assign({}, defaultValues);

        for (const m of Object.keys(matches.groups)) {
            if (m[0] == '_') {
                continue;
            }
            parsed[m] = parseInfo(matches.groups, m, parsed[m]);
        }

        /** @type {string|number} */
        this.qualif = parsed.qualif;
        this.title = parsed.title;
        this.yearMin = parsed.yearMin;
        this.yearMax = parsed.yearMax;

        if (!isRange(this.humanReadable()) && (parsed.year > 0)) {
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
                        if (this.isTimestamped())
                            this.moment = this.moment.tz(tz); // true: force to keep the initial value, false: convert
                    }
                }
            }
        }
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

    isTimestamped() {
        return this.moment != null;
    }

    humanReadable() {
        if (!this.isTimestamped()) {
            return '';
        }

        return canonizeTimestamp(this.moment.format('YYYY-MM-DD HH-mm-ss'));
    }
}

/**
 * @param str
 */
export function tsFromString(str) {
    return new Timestamp(str);
}

export const regexps = { android };