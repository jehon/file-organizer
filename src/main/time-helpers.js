import tzlookup from 'tz-lookup';
import Timestamp from './timestamp.js';

// TODO(timestamp): factorize it here
// TODO: rewrite all based on string

// /**
//  * @param {string} time - the time
//  * @param {string} toTZ - the timezone in which to set the time
//  */
// export function utc2local(time, toTZ) {

// }

// /**
//  * @param {string} time - the time
//  * @param {string} fromTZ - the timezone of the time
//  */
// export function local2utc(time, fromTZ) {

// }

/**
 * @param {module:src/main/Timestamp} timestamp to be checked
 * @returns {boolean} if it is yyyy-yyyy format or yyyy-mm yyyy-mm format
 */
export function isRange(timestamp) {
    return timestamp.yearMin > 0 && timestamp.yearMax > 0;
}

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

/**
 * match test if the timestamp match against (larger) ts
 *
 * @param {Timestamp} strict to be compared
 * @param {Timestamp} larger to be compared
 * @returns {boolean} if it match
 */
export function timestampMatch(strict, larger) {
    if (strict.isTextOnly()) {
        return true;
    }

    if (isRange(larger)) {
        return strict.moment.year() >= larger.yearMin && strict.moment.year() <= larger.yearMax;
    }

    if (strict.humanReadable().startsWith(larger.humanReadable())) {
        return true;
    }

    return false;
}

/**
 * MatchAgainstLithe test if the timestamp match against (larger) ts, but by closest month
 *
 * @param {Timestamp} strict to be compared
 * @param {Timestamp} larger to be compared
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
        const ref = larger.clone();
        ref.yearMonthOnly();
        if (timestampMatch(strict, ref)) {
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
        if (timestampMatch(strict, ref)) {
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
        if (timestampMatch(strict, ref)) {
            return true;
        }
    }
    return false;
}