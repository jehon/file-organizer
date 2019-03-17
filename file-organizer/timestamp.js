
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

// TODO (one shot?) later: remove "h" / "m" possibilities ?
const ts = /(?<year>(19|20)[0-9][0-9])(-(?<month>[0-1][0-9])(-(?<day>[0-3][0-9]))?)?( (?<hour>[0-2][0-9])(h|-)(?<minute>[0-5][0-9])(m|-)(?<second>[0-5][0-9]))?/;

const rest = /(?<rest>([ ][ -]*(?<_tag>((?<comment>.*)?( - )?(?<original>([A-Z0-9_]{8}|(IMG|VID)_[0-9]{8}_[0-9]{6})))|(?<comment2>.*))|))?/;

const yearUnammed = /(19|20)[0-9][0-9]/;

//
// The matchers:
//

// TODO: insert comment and original
// /^(?!.*foo|.*bar).*$/

const final = new RegExp(`^${ts.source}( (?<comment>(?!.* - )[^[]+))?( \\[(?<original>.+)\\])?$`);

const android = /^(?<original>(VID|IMG)_(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2}))$/;

const screen = /^(?<original>(?<year>(19|20)[0-9]{2})(?<month>[0-9]{2})(?<day>[0-9]{2})_(?<hour>[0-9]{2})(?<minute>[0-9]{2})(?<second>[0-9]{2}))(?<_tag>(?<comment>.*))?$/;


const yearRange = new RegExp(`^(?<yearMin>${yearUnammed.source})-(?<yearMax>${yearUnammed.source})( (?<comment>.*))?$`);

const version1 = new RegExp(`^${ts.source}( (?<comment>.*?))?( - (?<original>.*))$`);

const invalid = /^(?<_tag>(?<comment>.*$))/;

const matchers = {
	version1, // Legacy
	final,
	android,
	screen,
	yearRange,

	invalid // fallback
};

exports.defaultValues = {
	year:     0,
	month:    0,
	day:      0,
	hour:    -1,
	minute:   0,
	second:   0,

	original: '', // in the tag, the filename
	comment:  '',  // in the tag, the rest (out of the filename)

	yearMin:  0,
	yearMax:  0
};

class Timestamp {
	constructor(str = '') {
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
		if (this.comment2 > '') {
			this.comment = this.comment2;
		}

		return;
	}

	clone() {
		return Object.assign(new Timestamp(), this);
	}

	TS() {
		let res = '';
		if (this.year == 0) {
			return res;
		}
		res += ('' + this.year).padStart(4, '0');
		if (this.month == 0) {
			return res;
		}
		if (this.month == 1 && this.day == 1 && this.hour == 0 && this.minute == 0 && this.second == 0) {
			return res;
		}
		res += '-' + ('' + this.month).padStart(2, '0');
		if (this.day == 0) {
			return res;
		}
		// We hardcode a limit where the day has no meaning...
		if (this.day < 0 || (this.year < 1998 && this.day < 2 && this.hour == 0 && this.minute == 0 && this.second == 0)) {
			return res;
		}
		res += '-' + ('' + this.day).padStart(2, '0');
		if (this.hour < 0 || (this.hour == 0 && this.minute == 0 && this.second == 0)) {
			return res;
		}
		res += ' ' + ('' + this.hour).padStart(2, '0');
		res += '-' + ('' + this.minute).padStart(2, '0');
		res += '-' + ('' + this.second).padStart(2, '0');
		return res;
	}

	// match test if the timestamp match against (larger) ts
	match(larger) {
		if (larger.yearMin > 0 && larger.yearMax > 0) {
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
			lts.day = 0;
			if (this.match(lts)) {
				return true;
			}
		}
		{ // By month before
			const before = Object.assign(new Timestamp(), larger);
			before.day = 0;
			if (before.month == 0) {
				// Match by year
				before.month = 1;
			}
			if (before.month == 1) {
				before.year = before.year - 1;
				before.month = 12;
			} else {
				before.month = before.month - 1;
			}
			if (this.match(before)) {
				return true;
			}
		}
		{ // By month after
			const after = Object.assign(new Timestamp(), larger);
			after.day = 0;
			if (after.month == 0) {
				// Match by year
				after.month = 12;
			}
			if (after.month == 12) {
				after.year = after.year + 1;
				after.month = 1;
			} else {
				after.month = after.month + 1;
			}
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

exports.tsFromDate = function(date) {
	const ts = new Timestamp('');
	ts.year = date.getUTCFullYear();
	ts.month = date.getUTCMonth() + 1;
	ts.day = date.getUTCDate();
	ts.hour = date.getUTCHours();
	ts.minute = date.getUTCMinutes();
	ts.second = date.getUTCSeconds();
	return ts;
};

exports.Timestamp = Timestamp;
exports.regexps = {
	android
};
