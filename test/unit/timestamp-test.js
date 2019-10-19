
const { regexps, tsFromString, tsFromExiv, defaultValues, tzFromGPS } = require('../../file-organizer/timestamp.js');
var { diff } = require('just-diff');

function compareWith(originalString, compareTo, strict = true) {
	const parsed = tsFromString(originalString);
	const target = strict ? Object.assign({}, defaultValues, compareTo) : compareTo;

	let dd = '';
	for(let d of diff(compareTo, parsed)) {
		let op = '';
		switch(d.op) {
		case 'add':
			op = '+';
			break;
		case 'replace':
			op = '~';
			break;
		case 'remove':
			op = '-';
			break;
		default:
			console.error('invalid diff operation: ', d);
		}
		op += d.path + '[' + d.value + ']';
		dd += op + ' ^ ';
	}

	return expect(parsed)
		.withContext(`Not correctly mapped: ${originalString}: ${dd}`)
		.toEqual(jasmine.objectContaining(target));
}

describe('timestamp-test', function() {
	describe('parsing', function() {
		//
		//
		// Parsing
		//
		//
		it('should parse "final" elements', function() {
			compareWith('2018', {
				type: 'final',
				year: 2018
			});

			compareWith('2018-09-08', {
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
			});

			compareWith('2018-09-08 13-14-15', {
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				hour: 13,
				minute: 14,
				second: 15
			});

			compareWith('2018-09-08 13-14-15 test', {
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				hour: 13,
				minute: 14,
				second: 15,
				comment: 'test'
			});

			compareWith('2018-09-08 13-14-15 [file]', {
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				hour: 13,
				minute: 14,
				second: 15,
				original: 'file'
			});

			compareWith('2018-09-08 13-14-15 test [file]', {
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				hour: 13,
				minute: 14,
				second: 15,
				comment: 'test',
				original: 'file'
			});

			compareWith('2018-09-08 test [file]', {
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				comment: 'test',
				original: 'file'
			});

			compareWith('2018 test [file]', {
				type: 'final',
				year: 2018,
				comment: 'test',
				original: 'file'
			});

			compareWith('2018 test', {
				type: 'final',
				year: 2018,
				comment: 'test',
			});

			compareWith('2015-12-11 02-03-55 Bangaldesh - A la mer', {
				type: 'final',
				year: 2015,
				month: 12,
				day: 11,
				hour: 2,
				minute: 3,
				second: 55,
				comment: 'Bangaldesh - A la mer'
			});

			compareWith('2019-03-24 12-14-46', {
				type: 'final',
				year: 2019,
				month: 3,
				day: 24,
				hour: 12,
				minute: 14,
				second: 46
			});

			// Legacy
			compareWith('2018 bonjour 2019', {
				type: 'final',
				year: 2018,
				comment: 'bonjour 2019',
			});

			// Legacy
			compareWith('2018-01 bonjour 2019', {
				type: 'final',
				year: 2018,
				month: 1,
				comment: 'bonjour 2019',
			});

			// Legacy
			compareWith('2018-01-15 bonjour 2019', {
				type: 'final',
				year: 2018,
				month: 1,
				day: 15,
				comment: 'bonjour 2019',
			});
		});

		it('should parse timestamps elements', function() {
			// With timezone
			compareWith('2019-03-24 12-14-46+01:00', {
				type: 'final',
				year: 2019,
				month: 3,
				day: 24,
				hour: 12,
				minute: 14,
				second: 46,
				timezone: '+01:00'
			});

			// With timezone
			compareWith('2019:03:24 12:14:46+01:00', {
				type: 'final',
				year: 2019,
				month: 3,
				day: 24,
				hour: 12,
				minute: 14,
				second: 46,
				timezone: '+01:00'
			});
		});

		it('should parse canon pictures and movies', function() {
			compareWith('DSC_1234', {
				type: 'raw8_3',
				original: 'DSC_1234'
			});
		});

		it('should parse "android" elements', function() {
			compareWith('VID_20180102_030405', {
				type: 'android',
				year: 2018,
				month: 1,
				day: 2,
				hour: 3,
				minute: 4,
				second: 5,

				original: 'VID_20180102_030405'
			});

			compareWith('IMG_20180102_030405', {
				type: 'android',
				year: 2018,
				month: 1,
				day: 2,
				hour: 3,
				minute: 4,
				second: 5,

				original: 'IMG_20180102_030405'
			});

			expect(regexps.android.test('IMG_20180304_050607')).toBeTruthy();
			expect(regexps.android.test('VID_20121215_111704')).toBeTruthy();
		});

		it('should parse "screen" elements', function() {
			compareWith('20150306_153340', {
				type: 'screen',
				year: 2015,
				month: 3,
				day: 6,
				hour: 15,
				minute: 33,
				second: 40,

				original: '20150306_153340',

				comment: '',
			});

			compareWith('20150306_153340 Cable internet dans la rue', {
				type: 'screen',
				year: 2015,
				month: 3,
				day: 6,
				hour: 15,
				minute: 33,
				second: 40,

				original: '20150306_153340',

				comment: 'Cable internet dans la rue',
			});
		});

		it('should parse "yearRange" elements', function() {
			compareWith('2015-2016', {
				type: 'yearRange',
				yearMin: 2015,
				yearMax: 2016,
				year: 0,

				comment: '',
			});

			compareWith('2015-2016 with comment', {
				type: 'yearRange',
				yearMin: 2015,
				yearMax: 2016,
				year: 0,

				comment: 'with comment',
			});
		});

		it('should parse minimal format', function() {
			compareWith('canon', {
				type: 'minimal',
				comment: 'canon'
			}, false);

			compareWith('canon brol', {
				type: 'minimal',
				comment: 'canon brol'
			}, false);

		});

		it('should detect invalid formats', function() {
			compareWith('2018-01-02-03', {
				type: 'invalid',
				comment: '2018-01-02-03',
				original: '2018-01-02-03'
			});

			compareWith('brol - machin', {
				type: 'invalid'
			}, false);

			compareWith('brol 2018-01-02 machin', {
				type: 'invalid'
			}, false);
		});
	});

	describe('parsing legacy format', function() {
		// it('should parse version1* formats', function() {
		// 	compareWith('2010-12-30 09-09-51 Vie de famille - DSC_0155', {
		// 		type: 'version1',
		// 		year: 2010,
		// 		month: 12,
		// 		day: 30,
		// 		hour: 9,
		// 		minute: 9,
		// 		second: 51,
		// 		comment: 'Vie de famille',
		// 		original: 'DSC_0155',
		// 	});

		// 	// Tags
		// 	compareWith('2018-01-15 bonjour - ABCDE123', {
		// 		type: 'version1',
		// 		comment: 'bonjour',
		// 		original: 'ABCDE123'
		// 	}, false);

		// 	compareWith('2018-01-15 bonjour - DSC_0101', {
		// 		type: 'version1',
		// 		comment: 'bonjour',
		// 		original: 'DSC_0101'
		// 	}, false);

		// 	compareWith('2012-08-07 10-03-05 Muguette Donnay - Plaine de jeux des chansons - IMG_6893', {
		// 		comment: 'Muguette Donnay - Plaine de jeux des chansons',
		// 		original: 'IMG_6893'
		// 	}, false);

		// 	compareWith('2012-11-04 12-13-27 VID_20121104_121327', {
		// 		type: 'version0',
		// 		year: 2012,
		// 		comment: '',
		// 		original: 'VID_20121104_121327'
		// 	}, false);

		// 	compareWith('2012-05-26 11-37-24 vie de famille - VID_20120526_113724', {
		// 		type: 'version1',
		// 		year: 2012,
		// 		comment: 'vie de famille',
		// 		original: 'VID_20120526_113724'
		// 	}, false);
		// });
	});

	describe('functionalities', function() {
		//
		//
		// Functionnal stuffs
		//
		//

		// TODO: WIP
		it('should generate exiv tag', () => {
			expect(tsFromString('2019-01-02 03-04-05')                   .exiv()).toBe('2019:01:02 03:04:05');
			expect(tsFromString('2019-01-02 03-04-05', 'Europe/Brussels').exiv()).toBe('2019:01:02 03:04:05');
			expect(tsFromString('2019-01-02 03-04-05', 'Asia/Taipei')    .exiv()).toBe('2019:01:02 03:04:05');

			expect(tsFromExiv('2019-02-02 15:16:17', 'Europe/Brussels').TS()).toBe('2019-02-02 16-16-17', 'Winter time');
			expect(tsFromExiv('2019-07-02 15:16:17', 'Europe/Brussels').TS()).toBe('2019-07-02 17-16-17', 'summer time');

			expect(tsFromString('2019-01-02 03-04-05').exiv())            .toBe('2019-01-02 03-04-05');
			expect(tsFromString('2019-01-02 03-04-05').exiv()).toBe('2019-01-02 03-04-05');
			expect(tsFromString('2019-01-02 03-04-05').exiv()).toBe('2019-01-02 03-04-05');

			// TODO: temp !
			expect(tsFromString('2018').exiv()).toBe('2018:00:00 00:00:00');
		});

		it('should be clonable', function() {
			let ts0 = tsFromString('2018-01-02');
			expect(ts0.year).toBe(2018);
			expect(ts0.TS()).toBe('2018-01-02');

			let ts1 = ts0.clone();
			ts1.year = 2019;
			expect(ts0.year).toBe(2018);
			expect(ts0.TS()).toBe('2018-01-02');

			expect(ts1.year).toBe(2019);
			expect(ts1.TS()).toBe('2019-01-02');
		});

		it('should match timestamps', function() {
			expect(tsFromString('2018-01-02').match(tsFromString('2018-01'))).toBeTruthy();
			expect(tsFromString('2018-01-02').match(tsFromString('2018'))).toBeTruthy();

			expect(tsFromString('2018-01-02').match(tsFromString('2019'))).toBeFalsy();

			// Invalid
			expect(tsFromString('2018-01-02').match(tsFromString(''))).toBeTruthy();
			expect(tsFromString('').match(tsFromString('2018'))).toBeFalsy();
			expect(tsFromString('').match(tsFromString(''))).toBeTruthy();
		});

		it('should match timestamps exactly', function() {
			expect(tsFromString('2018-01-02').matchExact(tsFromString('2018-01'))).toBeFalsy();
			expect(tsFromString('2018-01').matchExact(tsFromString('2018-01'))).toBeTruthy();

			expect(tsFromString('2018-01-02 00-00-00').matchExact(tsFromString('2018-01-02'))).toBeTruthy();
			expect(tsFromString('2018-01-02 00-00-01').matchExact(tsFromString('2018-01-02'))).toBeFalsy();
			expect(tsFromString('2018-01-02 00-00-01').matchExact(tsFromString('2018-01-02 00-00-01'))).toBeTruthy();
		});

		it('should match timestamps lithe', function() {
			expect(tsFromString('2018-01-02').matchLithe(tsFromString('2018-01'))).toBeTruthy();

			expect(tsFromString('2018-01-02').matchLithe(tsFromString('2017-12-31'))).toBeTruthy();

			expect(tsFromString('2018-01-02').matchLithe(tsFromString('2018-02'))).toBeTruthy();
			expect(tsFromString('2018-01-02').matchLithe(tsFromString('2017-12'))).toBeTruthy();
			expect(tsFromString('2018-12-30').matchLithe(tsFromString('2019-01'))).toBeTruthy();


			expect(tsFromString('2018-01-02').matchLithe(tsFromString('2017'))).toBeTruthy();
			expect(tsFromString('2018-12-30').matchLithe(tsFromString('2019'))).toBeTruthy();

			// 	// Real tests
			expect(tsFromString('2009-02-22').matchLithe(tsFromString('2009-02-21'))).toBeTruthy();
		});

		it('should match timestamps range', function() {
			const bt = tsFromString('1990-2000 rest');
			expect(bt.year).toBe(0);
			expect(bt.month).toBe(0);

			expect(bt.yearMin).toBe(1990);


			expect(bt.yearMax).toBe(2000);
			expect(bt.comment).toBe('rest');

			expect(tsFromString('1990-01-03 test').match(bt)).toBeTruthy();
			expect(tsFromString('1998-01-03 test').match(bt)).toBeTruthy();
			expect(tsFromString('2000-01-03 test').match(bt)).toBeTruthy();

			expect(tsFromString('1989-01-03 test').match(bt)).toBeFalsy();
			expect(tsFromString('2001-01-03 test').match(bt)).toBeFalsy();


			expect(tsFromString('1990-01-03 test').matchLithe(bt)).toBeTruthy();
			expect(tsFromString('1998-01-03 test').matchLithe(bt)).toBeTruthy();
			expect(tsFromString('2000-01-03 test').matchLithe(bt)).toBeTruthy();

			expect(tsFromString('1989-01-03 test').matchLithe(bt)).toBeFalsy();
			expect(tsFromString('2001-01-03 test').matchLithe(bt)).toBeFalsy();
		});
	});

	it('tzFromGPS', () => {
		expect(tzFromGPS('50 deg 35\' 30.84" N, 5 deg 33\' 25.92" E')).toBe('Europe/Brussels');
	});
});

