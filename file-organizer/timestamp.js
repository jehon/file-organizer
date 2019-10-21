
const tzlookup = require('tz-lookup');
const moment = require('moment');
require('moment-timezone');

function parseInfo(obj, k, def) {
	if (k in obj && obj[k]) {
		const val = +obj[k];
		if (isNaN(val)) {
			return obj[k].trim();
		}
		return val;
	}
	return def;
}

function removeNames(r) {
	let str = r.source;
	return str.replace(/\?<[^>]+>/g, '');
}

const ts = /(?<year>[0-9][0-9][0-9][0-9])([-:](?<month>[0-1][0-9])([-:](?<day>[0-3][0-9]))?)?( (?<hour>[0-2][0-9])[:-](?<minute>[0-5][0-9])([:-](?<second>[0-5][0-9])(?<timezone>[+-]\d\d:\d\d)?))?/;

const yearUnammed = /[0-9][0-9][0-9][0-9]/;

//
// The matchers:
//

const tsOnly = /^${ts.source}$/;


const raw8_3 = new RegExp('^(?<original>[A-Z0-9_]{8})$');

const final = new RegExp(`^${ts.source}( (?<comment>[^[]*))?( \\[(?<original>.+)\\])?$`);

const android = /^(?<original>(VID|IMG)_(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2}))$/;

const screen = /^(?<original>(?<year>(19|20)[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2}))(?<comment>.*)?$/;

const yearRange = new RegExp(`^(?<yearMin>${yearUnammed.source})-(?<yearMax>${yearUnammed.source})( (?<comment>.*))?$`);

const minimal = new RegExp(`^(?!${ts.source})(?<original>(?<comment>(?!.* - )(?!.* ${removeNames(ts)}).*))`);

const invalid = /^(?<comment>(?<original>.*$))/; // Fallback

const matchers = {
	raw8_3,
	tsOnly,
	final,
	android,
	screen,
	yearRange,
	minimal,

	invalid // Fallback
};

exports.defaultValues = {
	year:      0,
	month:    -1, // -> YYYY:01:01 01:01:01
	day:      -1, // -> YYYY:MM:02 02:02:02
	hour:      0,
	minute:    0,
	second:    0,

	original: '', // in the tag, the filename
	comment:  '',  // in the tag, the rest (out of the filename)

	yearMin:   0,
	yearMax:   0
};

const MomentJSParseTS = 'YYYY-MM-DD HH-mm-SS';
const EMPTY_EXIV = '0000:00:00 00:00:00';

class Timestamp {
	constructor(str = '', tz = false) {
		Object.assign(this, exports.defaultValues);

		this.string   = str;

		let matches = {};
		for(const k of Object.keys(matchers)) {
			const re = new RegExp(matchers[k], 'gm');
			matches = re.exec(str);
			if (matches && matches.groups) {
				this.type     = k;

				for(const m of Object.keys(matches.groups)) {
					if (m[0] == '_') {
						continue;
					}
					this[m]   = parseInfo(matches.groups, m, this[m]);
				}
				break;
			}
		}

		if (this.isTextOnly()) {
			// Nothing to do
			this.moment = null;
		} else {
			if (this.isRange()) {
				this.moment = null;
			} else {
				// // We hardcode a limit where the day has no meaning...
				if (this.month < 0 || (this.year < 1998 && this.day < 2 && this.hour < 1 && this.minute < 1 && this.minute < 1)) {
					this.yearOnly();
				}

				if (this.day < 0) {
					this.yearMonthOnly();
				}

				this.moment = moment([ this.year, this.month - 1, this.day, this.hour, this.minute, this.second ]);
				if (tz) {
					this.moment.tz(tz, true); // true: force to keep the initial value
				}
			}
		}

		return;
	}

	clone() {
		return Object.assign(new Timestamp(), this);
	}

	yearMonthOnly() {
		this.day = 2;
		this.hour = 2;
		this.minute = 2;
		this.second = 2;
	}

	yearOnly() {
		this.month = 1;
		this.day = 1;
		this.hour = 1;
		this.minute = 1;
		this.second = 1;
	}

	isTextOnly() {
		return !this.isRange() && this.year < 1;
	}

	isRange() {
		return this.yearMin > 0 && this.yearMax > 0;
	}

	isYearMonthOnly() {
		return !this.isRange() && this.TS().length == 7;
	}

	isYearOnly() {
		return !this.isRange() && this.TS().length == 4;
	}

	TS() {
		let res = '';
		if (this.isTextOnly()) {
			return '';
		}
		if (this.isRange()) {
			return '';
		}
		if (this.year == 0) {
			return res;
		}
		res = res
			+ ('' + this.year)        .padStart(4, '0')
			+ '-' + ('' + this.month) .padStart(2, '0')
			+ '-' + ('' + this.day)   .padStart(2, '0')

			+ ' ' + ('' + this.hour)  .padStart(2, '0')
			+ '-' + ('' + this.minute).padStart(2, '0')
			+ '-' + ('' + this.second).padStart(2, '0');

		return res
			.replace('-01-01 01-01-01', '')
			.replace(   '-02 02-02-02', '')
			.replace(      ' 00-00-00', '');
	}

	exiv() {
		// if (tz && this.TS().length > 10) {
		// 	// We have a time and a timezone
		// 	const exiv = this.moment.clone();
		// 	exiv.tz(tz, true); // true: force to keep the initial value
		// 	return exiv.utc().format('YYYY:MM:DD HH:mm:ss');
		// }
		if (this.isTextOnly() || this.isRange()) {
			return EMPTY_EXIV;
		}
		// return this.moment.format('YYYY:MM:DD HH:mm:ss');

		return ('' + Math.max(0, this.year))       .padStart(4 , '0')
			+ ':' + ('' + Math.max(0, this.month)) .padStart(2, '0')
			+ ':' + ('' + Math.max(0, this.day))   .padStart(2, '0')
			+ ' ' + ('' + Math.max(0, this.hour))  .padStart(2, '0')
			+ ':' + ('' + Math.max(0, this.minute)).padStart(2, '0')
			+ ':' + ('' + Math.max(0, this.second)).padStart(2, '0');
	}

	// match test if the timestamp match against (larger) ts
	match(larger) {
		if (this.isTextOnly()) {
			return true;
		}

		if (larger.isRange()) {
			return this.year >= larger.yearMin && this.year <= larger.yearMax;
		}

		if (this.TS().startsWith(larger.TS())) {
			return true;
		}

		return false;
	}

	// MatchExact test if two TS are exactly the same
	matchExact(t2) {
		if (!this.match(t2)) {
			return false;
		}
		return (this.TS() == t2.TS());
	}

	// MatchAgainstLithe test if the timestamp match against (larger) ts, but by closest month
	matchLithe(larger) {
		if (this.match(larger)) {
			return true;
		}
		{ // By same month
			const lts = Object.assign(new Timestamp(), larger);
			lts.yearMonthOnly();
			if (this.match(lts)) {
				return true;
			}
		}
		{ // By month before
			const before = Object.assign(new Timestamp(), larger);
			if (before.isYearOnly()) {
				// Match by year
				before.month = 1;
			}
			if (before.month == 1) {
				before.year = before.year - 1;
				before.month = 12;
			} else {
				before.month = before.month - 1;
			}
			before.yearMonthOnly();
			if (this.match(before)) {
				return true;
			}
		}
		{ // By month after
			const after = Object.assign(new Timestamp(), larger);
			if (after.isYearOnly()) {
				// Match by year
				after.month = 12;
			}
			if (after.month == 12) {
				after.year = after.year + 1;
				after.month = 1;
			} else {
				after.month = after.month + 1;
			}
			after.yearMonthOnly();
			if (this.match(after)) {
				return true;
			}
		}
		return false;
	}

}

exports.tsFromString = function(str) {
	return new Timestamp(str);
};

exports.tsFromExiv = function(str, tz = false) {
	return new Timestamp(str, tz);
};

exports.Timestamp = Timestamp;
exports.regexps = {
	android
};

exports.tzFromGPS = function(GPS) {
	const p = function(str) {
		const parser = /(?<v1>\d+) deg (?<v2>\d+)' (?<v3>\d+)\.(?<v4>\d+)" (?<orien>(N|S|E|O))/;
		const c = str.match(parser);
		const val = (parseInt(c.groups.v1)
			+ (parseInt(c.groups.v2) / 60)
			+ ((parseInt(c.groups.v3) + parseInt(c.groups.v4) /100) / 3600)
		) * (c.groups.orien == 'N' || c.groups.orien == 'E' ? 1 : -1);
		return val;
	};

	const coord = GPS.split(',');

	const lat = p(coord[0]);
	const long = p(coord[1]);

	return tzlookup(lat, long);
};
