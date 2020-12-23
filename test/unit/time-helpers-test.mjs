
import { FOError } from '../../src/main/file-types/file.js';
import { canonizeTimestamp, coordonate2tz, date2string, isRange, parseRange, timestampMatch, timestampMatchLithe } from '../../src/main/time-helpers.js';
import { t } from '../test-helper.js';

describe(t(import.meta), function () {
    it('date2string', function () {
        expect(date2string(new Date('2 May 1980'))).toBe('1980-05-02 00-00-00');
    });

    it('canonize', function () {
        expect(canonizeTimestamp('1980-01-01 01-01-01')).toBe('1980');
        expect(canonizeTimestamp('1980-01-02 02-02-02')).toBe('1980-01');
        expect(canonizeTimestamp('1980-02-02 02-02-02')).toBe('1980-02');
        expect(canonizeTimestamp('1980-01-01 00-00-00')).toBe('1980-01-01');
        expect(canonizeTimestamp('1980-02-03 00-00-00')).toBe('1980-02-03');
    });

    it('isRange and parseRange', () => {
        const bt = '1990-2000';
        expect(isRange(bt)).toBeTruthy();

        expect(parseRange(bt).yearMin).toBe(1990);
        expect(parseRange(bt).yearMax).toBe(2000);

        expect(isRange('12-13')).toBeFalse();
        expect(() => parseRange('12-13')).toThrowError(FOError);
    });

    it('coordonate2tz', () => {
        expect(coordonate2tz('50 deg 35\' 30.84" N, 5 deg 33\' 25.92" E')).toBe('Europe/Brussels');
    });

    it('should timestampMatch', function () {
        expect(timestampMatch('2018-01-02', '2018-01')).toBeTruthy();
        expect(timestampMatch('2018-01-02', '2018')).toBeTruthy();

        expect(timestampMatch('2018-01-02', '2019')).toBeFalsy();

        // Invalid
        expect(timestampMatch('2018-01-02', '')).toBeTruthy();
        expect(timestampMatch('', '2018')).toBeTruthy();
        expect(timestampMatch('', '')).toBeTruthy();
    });

    it('should timestampMatchLithe', function () {
        expect(timestampMatchLithe('2018-01-02', '2018-01')).toBeTruthy();

        expect(timestampMatchLithe('2018-01-02', '2017-12-31')).toBeTruthy();

        expect(timestampMatchLithe('2018-01-02', '2018-02')).toBeTruthy();
        expect(timestampMatchLithe('2018-01-02', '2017-12')).toBeTruthy();
        expect(timestampMatchLithe('2018-12-30', '2019-01')).toBeTruthy();

        expect(timestampMatchLithe('2018-01-02', '2017')).toBeTruthy();
        expect(timestampMatchLithe('2018-12-30', '2019')).toBeTruthy();

        // Real tests
        expect(timestampMatchLithe('2009-02-22', '2009-02-21')).toBeTruthy();
    });

    it('should match timestamps range', function () {
        const bt = '1990-2000';

        expect(timestampMatch('1990-01-03', bt)).toBeTruthy();
        expect(timestampMatch('1998-01-03', bt)).toBeTruthy();
        expect(timestampMatch('2000-01-03', bt)).toBeTruthy();

        expect(timestampMatch('1989-01-03', bt)).toBeFalsy();
        expect(timestampMatch('2001-01-03', bt)).toBeFalsy();

        expect(timestampMatchLithe('1990-01-03', bt)).toBeTruthy();
        expect(timestampMatchLithe('1998-01-03', bt)).toBeTruthy();
        expect(timestampMatchLithe('2000-01-03', bt)).toBeTruthy();

        expect(timestampMatchLithe('1989-01-03', bt)).toBeFalsy();
        expect(timestampMatchLithe('2001-01-03', bt)).toBeFalsy();
    });
});