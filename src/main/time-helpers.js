
import tzlookup from 'tz-lookup';
import moment from 'moment';
import 'moment-timezone';

import { FOError } from './file-types/file.js';
import { pad } from '../common/string-utilities.js';

//
// if you create a Date object in valid ISO date format (YYYY-MM-DD), it will default to UTC instead of defaulting to the browser’s time zone.
//

//
// Hypothesis: the timestamp string always refer to the LOCAL TIME of the element
//   - in the filename, the timestamp is local
//   - a picture? the local time at the place where the picture was taken (taken into account the timezone)
//
// The timestamp is always canonized (except when sent back from fullTimestamp)
//

const yearRangeRegexp = /^(?<yearMin>(19|20)[0-9][0-9])-(?<yearMax>(19|20)[0-9][0-9])?$/;

export const EMPTY_TIME = '';

/************************
 *
 * Conversion utilities
 *
 */

/**
 * @param {string} str to be canonized
 * @returns {string} canonized
 */
export function canonizeTimestamp(str) {
    return str
        .replace('0000-00-00 00-00-00', EMPTY_TIME)
        .replace('-00-00 00-00-00', EMPTY_TIME) // Legacy exif
        .replace('-01-01 01-01-01', '')
        .replace('-02 02-02-02', '')
        .replace(' 00-00-00', '');
}

/**
 * @param {string} ts to be canonized
 * @returns {string} canonized
 */
export function fullTimestamp(ts) {
    if (ts.length == 0) {
        return '0000-00-00 00-00-00';
    }

    if (ts.length == 4) {
        return ts + '-01-01 01-01-01';
    }

    if (ts.length == 7) {
        return ts + '-02 02-02-02';
    }

    if (ts.length == 10) {
        return ts + ' 00-00-00';
    }

    return ts;
}

/**
 * @param {Date|moment} dateOrMoment to be formatted
 * @returns {string} formatted
 */
export function date2string(dateOrMoment) {
    if (!dateOrMoment) {
        return EMPTY_TIME;
    }

    if (moment.isMoment(dateOrMoment)) {
        return canonizeTimestamp(dateOrMoment.format('YYYY-MM-DD HH-mm-ss'));
    }

    let date = (/** @type {Date} */ /** @type {any} */ (dateOrMoment));

    return canonizeTimestamp(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`);
}

/**
 * @param {string} ts to be parsed
 * @returns {*} representing the date, in local timezone
 */
export function string2moment(ts) {
    if (ts.length < 19) {
        throw new Error(`Unimplemented: string2moment of ${ts}`);
    }
    return moment(ts, 'YYYY-MM-DD hh-mm-ss');
}

/*****************************************
 *
 * Test utilities
 *
 */

/**
 * @param {string} ts to be tested
 * @returns {boolean} if string is a 'YYYY-MM-DD hh-mm-ss'+
 */
export function isDateTime(ts) {
    return ts.length >= 19;
}


/**
 * @param {string} ts to be checked
 * @returns {boolean} if it is yyyy-yyyy format or yyyy-mm yyyy-mm format
 */
export function isRange(ts) {
    return yearRangeRegexp.test(ts);
}

/**
 * @private
 *
 * @param {string} string to be parsed
 *
 * @returns {object} parsed
 * @property {number} yearMin - lower bound
 * @property {number} yearMax - upper bound
 */
export function parseRange(string) {
    const matches = yearRangeRegexp.exec(string);
    if (!matches) {
        throw new FOError('is not a range');
    }

    return {
        yearMin: parseInt(matches.groups.yearMin),
        yearMax: parseInt(matches.groups.yearMax)
    };
}

/**********
 *
 * Equalities
 *
 */
/**
 * match test if the timestamp match against (larger) ts
 *
 * @param {string} tsStrict to be compared
 * @param {string} tsLarger to be compared
 * @returns {boolean} if it match
 */
export function timestampMatch(tsStrict, tsLarger) {
    if (!tsStrict) {
        return true;
    }

    if (isRange(tsLarger)) {
        const { yearMin, yearMax } = parseRange(tsLarger);
        const y = parseInt(tsStrict.substring(0, 4));
        return y >= yearMin && y <= yearMax;
    }

    return tsStrict.startsWith(tsLarger);
}

/**
 * MatchAgainstLithe test if the timestamp match against (larger) ts, but by closest month
 *
 * @param {string} tsStrict to be compared
 * @param {string} tsLarger to be compared
 * @returns {boolean} if it match
 */
export function timestampMatchLithe(tsStrict, tsLarger) {
    if (timestampMatch(tsStrict, tsLarger)) {
        return true;
    }
    if (isRange(tsLarger)) {
        return false;
    }

    { // By same month
        const ref = tsLarger.substring(0, 7); // yyyy-mm
        if (timestampMatch(tsStrict, ref)) {
            return true;
        }
    }

    { // By month before
        let year = parseInt(tsLarger.substr(0, 4));
        let month = tsLarger.length >= 6 ? parseInt(tsLarger.substr(5, 2)) : 1;
        month--;
        if (month == 0) {
            month = 12;
            year--;
        }
        if (timestampMatch(tsStrict, year + '-' + pad(month))) {
            return true;
        }
    }

    { // By month after
        let year = parseInt(tsLarger.substr(0, 4));
        let month = tsLarger.length >= 6 ? parseInt(tsLarger.substr(5, 2)) : 12;
        month++;
        if (month == 13) {
            month = 1;
            year++;
        }
        if (timestampMatch(tsStrict, year + '-' + pad(month))) {
            return true;
        }
    }
    return false;
}

/**************************
 *
 * Timezone utilities
 *
 */

/**
 * @param {string} ts as a basis
 * @param {string} tz as the timezone target
 * @returns {string} - the timestamp in local time
 */
export function utc2localTime(ts, tz) {
    if (!isDateTime(ts)) {
        // If we don't have a time, let's bail out
        return ts;
    }

    if (!tz) {
        return ts;
    }

    const m = string2moment(ts);

    // We adapt the tz field, but not the time (abstract time)
    const utc = m.tz('UTC', true);

    // We adapt the tz field, but not the time
    // @See https://momentjs.com/timezone/docs/#/using-timezones/converting-to-zone/
    const zoned = utc.tz(tz);

    return date2string(zoned);
}

/**
 * @param {string} ts as a basis
 * @param {string} tz as the timezone source
 * @returns {string} - the timestamp in utc
 */
export function localTime2utc(ts, tz = '') {
    if (!isDateTime(ts)) {
        // If we don't have a time, let's bail out
        return ts;
    }

    if (!tz) {
        return ts;
    }

    const m = string2moment(ts);
    // We adapt the tz field, but not the time
    // @See https://momentjs.com/timezone/docs/#/using-timezones/converting-to-zone/
    const zoned = m.tz(tz, true);

    const utc = zoned.clone().utc();

    return date2string(utc);
}

/******************************
 *
 * GPS Utilities
 *
 */

/**
 * Used mainly in EXIF
 *
 * @param {string} GPS - the exif coordonate (ex: 50 deg 35\' 30.84" N, 5 deg 33\' 25.92" E)
 * @returns {string} timezone
 */
export function coordonate2tz(GPS) {
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
}
