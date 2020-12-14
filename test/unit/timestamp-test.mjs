
import { t } from '../test-helper.js';

import { regexps, tsFromString, tsFromExif, tzFromGPS } from '../../file-organizer/timestamp.js';

/**
 * @param originalString
 * @param type
 * @param exifTarget
 * @param TSTarget
 * @param extra
 */
function isA(originalString, type, exifTarget, TSTarget = originalString, extra = {}) {
    const parsed = tsFromString(originalString);
    expect(parsed.type)
        .withContext(`${originalString}: Interpreted wrongly as`)
        .toBe(type);

    expect(parsed.exif())
        .withContext(`${originalString}: Not correctly interpreted as exif`)
        .toBe(exifTarget);

    expect(parsed.humanReadable())
        .withContext(`${originalString}: Not correctly interpreted as TS`)
        .toBe(TSTarget);

    for (const k of Object.keys(extra)) {
        expect(parsed[k])
            .withContext(`${originalString}: Key [${k}] incorrect`)
            .toBe(extra[k]);
    }
}

describe(t(import.meta), function () {
    describe('parsing human readable', function () {
        //
        //
        // Parsing
        //
        //
        it('should parse "final" elements', function () {
            isA('2018',
                'final', '2018:01:01 01:01:01');
            isA('2018-09-08',
                'final', '2018:09:08 00:00:00');
            isA('2018-09-08 13-14-15',
                'final', '2018:09:08 13:14:15');

            isA('2018-09-08 13-14-15 test',
                'final', '2018:09:08 13:14:15', '2018-09-08 13-14-15');

            isA('2018-09-08 13-14-15 [file]',
                'final', '2018:09:08 13:14:15', '2018-09-08 13-14-15',
                {
                    qualif: 'file',
                    title: ''
                });

            isA('2018-09-08 13-14-15 test [file]',
                'final', '2018:09:08 13:14:15', '2018-09-08 13-14-15',
                {
                    qualif: 'file',
                    title: 'test'
                });

            isA('2018-09-08 test [file]',
                'final', '2018:09:08 00:00:00', '2018-09-08',
                {
                    qualif: 'file',
                    title: 'test'
                });

            // Year only
            isA('2018 test [file]',
                'final', '2018:01:01 01:01:01', '2018',
                {
                    qualif: 'file',
                    title: 'test'
                });

            // Year only
            isA('2018 test',
                'final', '2018:01:01 01:01:01', '2018',
                {
                    qualif: '',
                    title: 'test'
                });

            isA('2015-12-11 02-03-55 Bangladesh - A la mer',
                'final', '2015:12:11 02:03:55', '2015-12-11 02-03-55',
                {
                    qualif: '',
                    title: 'Bangladesh - A la mer'
                });

            isA('2019-03-24 12-14-46',
                'final', '2019:03:24 12:14:46');

            // Year only
            isA('2018 bonjour 2019',
                'final', '2018:01:01 01:01:01', '2018',
                {
                    qualif: '',
                    title: 'bonjour 2019'
                });

            // Year-month only
            isA('2018-01 bonjour 2019',
                'final', '2018:01:02 02:02:02', '2018-01',
                {
                    qualif: '',
                    title: 'bonjour 2019'
                });

            // Year-month-day only
            isA('2018-01-15 bonjour 2019',
                'final', '2018:01:15 00:00:00', '2018-01-15',
                {
                    qualif: '',
                    title: 'bonjour 2019'
                });
        });

        it('should parse old elements', function () {
            isA('1980',
                'final', '1980:01:01 01:01:01', '1980');
            isA('1980-01',
                'final', '1980:01:01 01:01:01', '1980');
            isA('1980-02',
                'final', '1980:02:02 02:02:02', '1980-02');
            isA('1980-02-01',
                'final', '1980:02:02 02:02:02', '1980-02');
            isA('1980-02-03',
                'final', '1980:02:03 00:00:00', '1980-02-03');
        });

        it('should parse timestamps elements', function () {
            // With timezone
            isA('2019:03:24 12:14:46+01:00',
                'final', '2019:03:24 12:14:46', '2019-03-24 12-14-46',
                {
                });
        });

        it('should parse canon pictures and movies', function () {
            isA('DSC_1234',
                'raw8_3', '0000:00:00 00:00:00', '',
                {
                    qualif: 'DSC_1234',
                    title: ''
                });
        });

        it('should parse "android" elements', function () {
            isA('VID_20180102_030405',
                'android', '2018:01:02 03:04:05', '2018-01-02 03-04-05',
                {
                    qualif: 'VID_20180102_030405',
                    title: ''
                });

            isA('IMG_20180102_030405',
                'android', '2018:01:02 03:04:05', '2018-01-02 03-04-05',
                {
                    qualif: 'IMG_20180102_030405',
                    title: ''
                });

            isA('IMG-20180915-WA0001',
                'whatsapp', '2018:09:15 00:00:00', '2018-09-15',
                {
                    qualif: 'IMG-20180915-WA0001'
                });

            expect(regexps.android.test('IMG_20180304_050607')).toBeTruthy();
            expect(regexps.android.test('VID_20121215_111704')).toBeTruthy();
        });

        it('should parse "screen" elements', function () {
            isA('20150306_153340',
                'screen', '2015:03:06 15:33:40', '2015-03-06 15-33-40',
                {
                    qualif: '20150306_153340',
                    title: '',
                });

            isA('20150306_153340 Cable internet dans la rue',
                'screen', '2015:03:06 15:33:40', '2015-03-06 15-33-40',
                {
                    qualif: '20150306_153340',
                    title: 'Cable internet dans la rue',
                });
        });

        it('should parse "yearRange" elements', function () {
            isA('2015-2016',
                'yearRange', '0000:00:00 00:00:00', '',
                {
                    yearMin: 2015,
                    yearMax: 2016,
                    title: '',
                });

            isA('2015-2016 with title',
                'yearRange', '0000:00:00 00:00:00', '',
                {
                    yearMin: 2015,
                    yearMax: 2016,
                    title: 'with title',
                });
        });

        it('should parse minimal format', function () {
            isA('canon',
                'minimal', '0000:00:00 00:00:00', '',
                { title: 'canon' });

            isA('canon brol',
                'minimal', '0000:00:00 00:00:00', '',
                { title: 'canon brol' });

            isA('brol - machin',
                'minimal', '0000:00:00 00:00:00', '',
                {
                    title: 'brol - machin'
                });

            isA('canon brol [truc]',
                'minimal', '0000:00:00 00:00:00', '',
                {
                    title: 'canon brol',
                    qualif: 'truc'
                });

        });

        it('should detect invalid formats', function () {
            isA('2018-01-02-03',
                'invalid', '0000:00:00 00:00:00', '',
                {
                    title: '2018-01-02-03'
                });

            isA('brol 2018-01-02 machin',
                'invalid', '0000:00:00 00:00:00', '',
                {
                    title: 'brol 2018-01-02 machin'
                });

        });
    });

    describe('functionalities', function () {
        //
        //
        // Functionnal stuffs
        //
        //

        it('should generate exif timestamp', () => {
            // Date only cases
            expect(tsFromString('2018').exif()).toBe('2018:01:01 01:01:01');
            expect(tsFromString('2018-01').exif()).toBe('2018:01:02 02:02:02');
            expect(tsFromString('2018-02').exif()).toBe('2018:02:02 02:02:02');

            // exif is always in utc
            expect(tsFromExif('2019:07:02 15:16:17', 'Europe/Brussels').exif()).toBe('2019:07:02 15:16:17');
            expect(tsFromExif('2019:07:02 15:16:17', 'Asia/Dhaka').exif()).toBe('2019:07:02 15:16:17');

            // Normal case
            expect(tsFromString('2019-01-02 03-04-05').exif()).toBe('2019:01:02 03:04:05');


            expect(tsFromExif('2019:07:02 15:16:17').humanReadable()).withContext('No timezone').toBe('2019-07-02 15-16-17');
            expect(tsFromExif('2019:07:02 15:16:17', 'Europe/Brussels').humanReadable()).withContext('Summer time').toBe('2019-07-02 17-16-17');
            expect(tsFromExif('2019:02:02 15:16:17', 'Europe/Brussels').humanReadable()).withContext('Winter time').toBe('2019-02-02 16-16-17');

            expect(tsFromString('2019-01-02 03-04-05').exif()).toBe('2019:01:02 03:04:05');
        });

        it('should be clonable', function () {
            let ts0 = tsFromString('2018-01-02');
            expect(ts0.moment.year()).toBe(2018);
            expect(ts0.humanReadable()).toBe('2018-01-02');

            let ts1 = ts0.clone();
            ts1.moment.year(2019);
            expect(ts0.moment.year()).toBe(2018);
            expect(ts0.humanReadable()).toBe('2018-01-02');

            expect(ts1.moment.year()).toBe(2019);
            expect(ts1.humanReadable()).toBe('2019-01-02');
        });

        it('should match timestamps', function () {
            expect(tsFromString('2018-01-02').match(tsFromString('2018-01'))).toBeTruthy();
            expect(tsFromString('2018-01-02').match(tsFromString('2018'))).toBeTruthy();

            expect(tsFromString('2018-01-02').match(tsFromString('2019'))).toBeFalsy();

            // Invalid
            expect(tsFromString('2018-01-02').match(tsFromString(''))).toBeTruthy();
            expect(tsFromString('').match(tsFromString('2018'))).toBeTruthy();
            expect(tsFromString('').match(tsFromString(''))).toBeTruthy();
        });

        it('should match timestamps exactly', function () {
            expect(tsFromString('2018-01-02').matchExact(tsFromString('2018-01'))).toBeFalsy();
            expect(tsFromString('2018-01').matchExact(tsFromString('2018-01'))).toBeTruthy();

            expect(tsFromString('2018-01-02 00-00-00').matchExact(tsFromString('2018-01-02'))).toBeTruthy();
            expect(tsFromString('2018-01-02 00-00-01').matchExact(tsFromString('2018-01-02'))).toBeFalsy();
            expect(tsFromString('2018-01-02 00-00-01').matchExact(tsFromString('2018-01-02 00-00-01'))).toBeTruthy();
        });

        it('should match timestamps lithe', function () {
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

        it('should match timestamps range', function () {
            const bt = tsFromString('1990-2000 rest');
            expect(bt.isRange()).toBeTruthy();

            expect(bt.yearMin).toBe(1990);
            expect(bt.yearMax).toBe(2000);
            expect(bt.title).toBe('rest');

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

