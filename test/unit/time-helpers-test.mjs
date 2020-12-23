
import { coordonate2tz, isRange, timestampMatch, timestampMatchLithe } from '../../src/main/time-helpers.js';
import { tsFromString } from '../../src/main/timestamp.js';
import { t } from '../test-helper.js';

describe(t(import.meta), function () {
    it('isRange', () => {
        const bt = tsFromString('1990-2000 rest');
        expect(isRange(bt)).toBeTruthy();
    });

    it('coordonate2tz', () => {
        expect(coordonate2tz('50 deg 35\' 30.84" N, 5 deg 33\' 25.92" E')).toBe('Europe/Brussels');
    });

    it('should match timestamps', function () {
        expect(timestampMatch(tsFromString('2018-01-02'), tsFromString('2018-01'))).toBeTruthy();
        expect(timestampMatch(tsFromString('2018-01-02'), tsFromString('2018'))).toBeTruthy();

        expect(timestampMatch(tsFromString('2018-01-02'), tsFromString('2019'))).toBeFalsy();

        // Invalid
        expect(timestampMatch(tsFromString('2018-01-02'), tsFromString(''))).toBeTruthy();
        expect(timestampMatch(tsFromString(''), tsFromString('2018'))).toBeTruthy();
        expect(timestampMatch(tsFromString(''), tsFromString(''))).toBeTruthy();
    });

    // it('should match timestamps exactly', function () {
    //     expect(tsFromString('2018-01-02').matchExact(tsFromString('2018-01'))).toBeFalsy();
    //     expect(tsFromString('2018-01').matchExact(tsFromString('2018-01'))).toBeTruthy();

    //     expect(tsFromString('2018-01-02 00-00-00').matchExact(tsFromString('2018-01-02'))).toBeTruthy();
    //     expect(tsFromString('2018-01-02 00-00-01').matchExact(tsFromString('2018-01-02'))).toBeFalsy();
    //     expect(tsFromString('2018-01-02 00-00-01').matchExact(tsFromString('2018-01-02 00-00-01'))).toBeTruthy();
    // });

    it('should match timestamps lithe', function () {
        expect(timestampMatchLithe(tsFromString('2018-01-02'), tsFromString('2018-01'))).toBeTruthy();

        expect(timestampMatchLithe(tsFromString('2018-01-02'), tsFromString('2017-12-31'))).toBeTruthy();

        expect(timestampMatchLithe(tsFromString('2018-01-02'), tsFromString('2018-02'))).toBeTruthy();
        expect(timestampMatchLithe(tsFromString('2018-01-02'), tsFromString('2017-12'))).toBeTruthy();
        expect(timestampMatchLithe(tsFromString('2018-12-30'), tsFromString('2019-01'))).toBeTruthy();

        expect(timestampMatchLithe(tsFromString('2018-01-02'), tsFromString('2017'))).toBeTruthy();
        expect(timestampMatchLithe(tsFromString('2018-12-30'), tsFromString('2019'))).toBeTruthy();

        // 	// Real tests
        expect(timestampMatchLithe(tsFromString('2009-02-22'), tsFromString('2009-02-21'))).toBeTruthy();
    });

    it('should match timestamps range', function () {
        const bt = tsFromString('1990-2000 rest');
        expect(isRange(bt)).toBeTruthy(); // migrated

        expect(bt.yearMin).toBe(1990);
        expect(bt.yearMax).toBe(2000);
        expect(bt.title).toBe('rest');

        expect(timestampMatch(tsFromString('1990-01-03 test'), bt)).toBeTruthy();
        expect(timestampMatch(tsFromString('1998-01-03 test'), bt)).toBeTruthy();
        expect(timestampMatch(tsFromString('2000-01-03 test'), bt)).toBeTruthy();

        expect(timestampMatch(tsFromString('1989-01-03 test'), bt)).toBeFalsy();
        expect(timestampMatch(tsFromString('2001-01-03 test'), bt)).toBeFalsy();


        expect(timestampMatchLithe(tsFromString('1990-01-03 test'), bt)).toBeTruthy();
        expect(timestampMatchLithe(tsFromString('1998-01-03 test'), bt)).toBeTruthy();
        expect(timestampMatchLithe(tsFromString('2000-01-03 test'), bt)).toBeTruthy();

        expect(timestampMatchLithe(tsFromString('1989-01-03 test'), bt)).toBeFalsy();
        expect(timestampMatchLithe(tsFromString('2001-01-03 test'), bt)).toBeFalsy();
    });
});