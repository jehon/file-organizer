
const { regexps, tsFromDate, tsFromString, defaultValues } = require('../../file-organizer/timestamp.js');

function d(data) {
	return Object.assign({}, defaultValues, data);
}

describe('timestamp', function() {
	describe('parsing', function() {
		//
		//
		// Parsing
		//
		//
		it('should parse "final" elements', function() {
			expect(tsFromString('2018')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018
			})));

			expect(tsFromString('2018-09-08')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
			})));

			expect(tsFromString('2018-09-08 13-14-15')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				hour: 13,
				minute: 14,
				second: 15
			})));

			expect(tsFromString('2018-09-08 13-14-15 test')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				hour: 13,
				minute: 14,
				second: 15,
				comment: 'test'
			})));

			expect(tsFromString('2018-09-08 13-14-15 [file]')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				hour: 13,
				minute: 14,
				second: 15,
				original: 'file'
			})));

			expect(tsFromString('2018-09-08 13-14-15 test [file]')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				hour: 13,
				minute: 14,
				second: 15,
				comment: 'test',
				original: 'file'
			})));

			expect(tsFromString('2018-09-08 test [file]')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				month: 9,
				day: 8,
				comment: 'test',
				original: 'file'
			})));

			expect(tsFromString('2018 test [file]')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				comment: 'test',
				original: 'file'
			})));

			expect(tsFromString('2018 test')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				comment: 'test',
			})));
		});

		it('should parse "android" elements', function() {
			expect(tsFromString('VID_20180102_030405')).toEqual(jasmine.objectContaining(d({
				type: 'android',
				year: 2018,
				month: 1,
				day: 2,
				hour: 3,
				minute: 4,
				second: 5,

				original: 'VID_20180102_030405'
			})));

			expect(tsFromString('IMG_20180102_030405')).toEqual(jasmine.objectContaining(d({
				type: 'android',
				year: 2018,
				month: 1,
				day: 2,
				hour: 3,
				minute: 4,
				second: 5,

				original: 'IMG_20180102_030405'
			})));

			// other legacy tests
			expect(tsFromString('VID_20181124_183350').TS()).toBe('2018-11-24 18-33-50');
			expect(tsFromString('IMG_20181124_183350').TS()).toBe('2018-11-24 18-33-50');

			expect(regexps.android.test('IMG_20180304_050607')).toBeTruthy();
			expect(regexps.android.test('VID_20121215_111704')).toBeTruthy();
		});

		it('should parse "screen" elements', function() {
			expect(tsFromString('20150306_153340')).toEqual(jasmine.objectContaining(d({
				type: 'screen',
				year: 2015,
				month: 3,
				day: 6,
				hour: 15,
				minute: 33,
				second: 40,

				original: '20150306_153340',

				comment: '',
			})));

			expect(tsFromString('20150306_153340 Cable internet dans la rue')).toEqual(jasmine.objectContaining(d({
				type: 'screen',
				year: 2015,
				month: 3,
				day: 6,
				hour: 15,
				minute: 33,
				second: 40,

				original: '20150306_153340',

				comment: 'Cable internet dans la rue',
			})));
		});

		it('should parse "yearRange" elements', function() {
			expect(tsFromString('2015-2016')).toEqual(jasmine.objectContaining(d({
				type: 'yearRange',
				yearMin: 2015,
				yearMax: 2016,
				year: 0,

				comment: '',
			})));

			expect(tsFromString('2015-2016 with comment')).toEqual(jasmine.objectContaining(d({
				type: 'yearRange',
				yearMin: 2015,
				yearMax: 2016,
				year: 0,

				comment: 'with comment',
			})));
		});

		it('should parse minimal format', function() {
			expect(tsFromString('canon')).toEqual(jasmine.objectContaining({
				type: 'minimal',
				comment: 'canon'
			}));

			expect(tsFromString('canon brol')).toEqual(jasmine.objectContaining({
				type: 'minimal',
				comment: 'canon brol'
			}));

		});

		it('should detect invalid formats', function() {
			expect(tsFromString('2018-01-02-03')).toEqual(jasmine.objectContaining(d({
				type: 'invalid',
				comment: '2018-01-02-03',
				original: '2018-01-02-03'
			})));

			expect(tsFromString('brol - machin')).toEqual(jasmine.objectContaining({
				type: 'invalid'
			}));

			expect(tsFromString('brol 2018-01-02 machin')).toEqual(jasmine.objectContaining({
				type: 'invalid'
			}));
		});

		it('should parse legacy tests', function() {
			//
			// LEGACY tests
			//

			expect(tsFromString('2018 bonjour 2019')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				comment: 'bonjour 2019',
			})));

			expect(tsFromString('2018-01 bonjour 2019')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				month: 1,
				comment: 'bonjour 2019',
			})));

			expect(tsFromString('2018-01-15 bonjour 2019')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 2018,
				month: 1,
				day: 15,
				comment: 'bonjour 2019',
			})));

			expect(tsFromString('1999-09-09 12-00-01')).toEqual(jasmine.objectContaining(d({
				type: 'final',
				year: 1999,
				month: 9,
				day: 9,
				hour: 12,
				minute: 0,
				second: 1,
			})));
		});
	});

	describe('parsing legacy format', function() {
		it('should parse version1* formats', function() {
			expect(tsFromString('2010-12-30 09-09-51 Vie de famille - DSC_0155')).toEqual(jasmine.objectContaining(d({
				type: 'version1',
				year: 2010,
				month: 12,
				day: 30,
				hour: 9,
				minute: 9,
				second: 51,
				comment: 'Vie de famille',
				original: 'DSC_0155',
			})));

			// Tags
			expect(tsFromString('2018-01-15 bonjour - ABCDE123')).toEqual(jasmine.objectContaining({
				type: 'version1',
				comment: 'bonjour',
				original: 'ABCDE123'
			}));

			expect(tsFromString('2018-01-15 bonjour - DSC_0101')).toEqual(jasmine.objectContaining({
				type: 'version1',
				comment: 'bonjour',
				original: 'DSC_0101'
			}));

			expect(tsFromString('2012-08-07 10-03-05 Muguette Donnay - Plaine de jeux des chansons - IMG_6893')).toEqual(jasmine.objectContaining({
				comment: 'Muguette Donnay - Plaine de jeux des chansons',
				original: 'IMG_6893'
			}));

			expect(tsFromString('2012-11-04 12-13-27 VID_20121104_121327')).toEqual(jasmine.objectContaining({
				type: 'version0',
				year: 2012,
				comment: '',
				original: 'VID_20121104_121327'
			}));

			expect(tsFromString('2012-05-26 11-37-24 vie de famille - VID_20120526_113724')).toEqual(jasmine.objectContaining({
				type: 'version1',
				year: 2012,
				comment: 'vie de famille',
				original: 'VID_20120526_113724'
			}));
		});
	});

	describe('functionnalities', function() {
		//
		//
		// Functionnal stuffs
		//
		//
		it('should read pure date', () => {
			expect(tsFromDate(new Date('2019-01-02T03:04:05Z')).TS()).toBe('2019-01-02 03-04-05');
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
});
