
import tzlookup from 'tz-lookup';
import moment from 'moment';
import 'moment-timezone';

import { FOError } from './file-types/file.js';
import { pad } from '../common/string-utilities.js';

//
// if you create a Date object in valid ISO date format (YYYY-MM-DD), it will default to UTC instead of defaulting to the browser’s time zone.
//

//
// Hypothesis: the timestamp string always refer to the local time of the element
//   - in the filename, the timestamp is local
//   - a picture? the local time at the place where the picture was taken (taken into account the timezone)
//

const yearRangeRegexp = /^(?<yearMin>(19|20)[0-9][0-9])-(?<yearMax>(19|20)[0-9][0-9])?$/;

/************************
 *
 * Conversion utilities
 *
 */

/**
 * @param {string} string to be canonized
 * @returns {string} canonized
 */
export function canonizeTimestamp(string) {
    return string
        .replace('-01-01 01-01-01', '')
        .replace('-02 02-02-02', '')
        .replace(' 00-00-00', '');
}

/**
 * @param {Date|moment} dateOrMoment to be formatted
 * @returns {string} formatted
 */
export function date2string(dateOrMoment) {
    if (moment.isMoment(dateOrMoment)) {
        return canonizeTimestamp(dateOrMoment.format('YYYY-MM-DD HH-mm-ss'));
    }

    let date = (/** @type {Date} */ /** @type {any} */ (dateOrMoment));

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

/**
 * @param {string} date to be parsed
 * @returns {*} representing the date, in local timezone
 */
export function string2moment(date) {
    if (date.length < 19) {
        throw new Error(`Unimplemented: string2moment of ${date}`);
    }
    return moment(date, 'YYYY-MM-DD hh-mm-ss');
}

/*****************************************
 *
 * Test utilities
 *
 */

/**
 * @param {string} str to be tested
 * @returns {boolean} if string is a 'YYYY-MM-DD hh-mm-ss'+
 */
export function isDateTime(str) {
    return str.length >= 19;
}


/**
 * @param {string} timestamp to be checked
 * @returns {boolean} if it is yyyy-yyyy format or yyyy-mm yyyy-mm format
 */
export function isRange(timestamp) {
    return yearRangeRegexp.test(timestamp);
}

/**
 * @private
 *
 * @param {string} timestamp to be parsed
 *
 * @returns {object} parsed
 * @property {number} yearMin - lower bound
 * @property {number} yearMax - upper bound
 */
export function parseRange(timestamp) {
    const matches = yearRangeRegexp.exec(timestamp);
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
 * @param {string} strict to be compared
 * @param {string} larger to be compared
 * @returns {boolean} if it match
 */
export function timestampMatch(strict, larger) {
    if (!strict) {
        return true;
    }

    if (isRange(larger)) {
        const { yearMin, yearMax } = parseRange(larger);
        const y = parseInt(strict.substring(0, 4));
        return y >= yearMin && y <= yearMax;
    }

    return strict.startsWith(larger);
}

/**
 * MatchAgainstLithe test if the timestamp match against (larger) ts, but by closest month
 *
 * @param {string} strict to be compared
 * @param {string} larger to be compared
 * @returns {boolean} if it match
 */
export function timestampMatchLithe(strict, larger) {
    if (timestampMatch(strict, larger)) {
        return true;
    }
    if (isRange(larger)) {
        return false;
    }

    { // By same month
        const ref = larger.substring(0, 7); // yyyy-mm
        if (timestampMatch(strict, ref)) {
            return true;
        }
    }

    { // By month before
        let year = parseInt(larger.substr(0, 4));
        let month = larger.length >= 6 ? parseInt(larger.substr(5, 2)) : 1;
        month--;
        if (month == 0) {
            month = 12;
            year--;
        }
        if (timestampMatch(strict, year + '-' + pad(month))) {
            return true;
        }
    }

    { // By month after
        let year = parseInt(larger.substr(0, 4));
        let month = larger.length >= 6 ? parseInt(larger.substr(5, 2)) : 12;
        month++;
        if (month == 13) {
            month = 1;
            year++;
        }
        if (timestampMatch(strict, year + '-' + pad(month))) {
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
 * @param {string} str as a basis
 * @param {string} tz as the timezone target
 * @returns {string} - the timestamp in local time
 */
export function utc2localTime(str, tz) {
    if (!tz) {
        return str;
    }

    const m = string2moment(str);

    // We adapt the tz field, but not the time (abstract time)
    const utc = m.tz('UTC', true);

    // We adapt the tz field, but not the time
    // @See https://momentjs.com/timezone/docs/#/using-timezones/converting-to-zone/
    const zoned = utc.tz(tz);

    return date2string(zoned);
}

/**
 * @param {string} str as a basis
 * @param {string} tz as the timezone source
 * @returns {string} - the timestamp in utc
 */
export function localTime2utc(str, tz = '') {
    if (!tz) {
        return str;
    }

    const m = string2moment(str);
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
