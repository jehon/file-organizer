
import { t } from './help-functions.mjs';

import { FOError } from '../../src/main/file-types/file.js';
import {
    canonizeTimestamp,
    coordonate2tz,
    date2string,
    fullTimestamp,
    isDateTime,
    isRange,
    localTime2utc,
    parseRange,
    string2moment,
    timestampMatch,
    timestampMatchLithe,
    utc2localTime
} from '../../src/main/time-helpers.js';

describe(t(import.meta), function () {
    describe('conversion utilities', function () {
        it('canonize', function () {
            expect(canonizeTimestamp('0000-00-00 00-00-00')).toBe('');
            expect(canonizeTimestamp('1980-01-01 01-01-01')).toBe('1980');
            expect(canonizeTimestamp('1980-01-02 02-02-02')).toBe('1980-01');
            expect(canonizeTimestamp('1980-02-02 02-02-02')).toBe('1980-02');
            expect(canonizeTimestamp('1980-01-01 00-00-00')).toBe('1980-01-01');
            expect(canonizeTimestamp('1980-02-03 00-00-00')).toBe('1980-02-03');
            expect(canonizeTimestamp('1980-02-03 01-02-03')).toBe('1980-02-03 01-02-03');
        });

        it('fullTimestamp', function () {
            expect(fullTimestamp('')).toBe('0000-00-00 00-00-00');
            expect(fullTimestamp('1980')).toBe('1980-01-01 01-01-01');
            expect(fullTimestamp('1980-01')).toBe('1980-01-02 02-02-02');
            expect(fullTimestamp('1980-02')).toBe('1980-02-02 02-02-02');
            expect(fullTimestamp('1980-01-01')).toBe('1980-01-01 00-00-00');
            expect(fullTimestamp('1980-02-03')).toBe('1980-02-03 00-00-00');
            expect(fullTimestamp('1980-02-03 01-02-03')).toBe('1980-02-03 01-02-03');
        });

        it('date2string', function () {
            expect(date2string(new Date('2 May 1980'))).toBe('1980-05-02 00-00-00');
        });

        it('string2moment', function () {
            // expect(string2moment('2018').year()).toBe(2018);
            // expect(string2moment('2018').month()).toBe(0);
            // expect(string2moment('2018').date()).toBe(1);
            // expect(string2moment('2018').hour()).toBe(1);
            // expect(string2moment('2018').minutes()).toBe(1);
            // expect(string2moment('2018').seconds()).toBe(1);
            // expect(date2string(string2moment('2018'))).toBe('2018');

            // expect(string2moment('2018-02').year()).toBe(2018);
            // expect(string2moment('2018-02').month()).toBe(1);
            // expect(string2moment('2018-02').date()).toBe(1);
            // expect(string2moment('2018-02').hours()).toBe(0);
            // expect(string2moment('2018-02').minutes()).toBe(0);
            // expect(string2moment('2018-02').seconds()).toBe(0);

            // expect(string2moment('2018-02-02').year()).toBe(2018);
            // expect(string2moment('2018-02-02').month()).toBe(1);
            // expect(string2moment('2018-02-02').date()).toBe(2);
            // expect(string2moment('2018-02-02').hours()).toBe(0);
            // expect(string2moment('2018-02-02').minutes()).toBe(0);
            // expect(string2moment('2018-02-02').seconds()).toBe();

            expect(string2moment('2018-02-02 03-04-05').year()).toBe(2018);
            expect(string2moment('2018-02-02 03-04-05').month()).toBe(1);
            expect(string2moment('2018-02-02 03-04-05').date()).toBe(2);
            expect(string2moment('2018-02-02 03-04-05').hours()).toBe(3);
            expect(string2moment('2018-02-02 03-04-05').minutes()).toBe(4);
            expect(string2moment('2018-02-02 03-04-05').seconds()).toBe(5);
            expect(date2string(string2moment('2018-02-02 03-04-05'))).toBe('2018-02-02 03-04-05');
        });
    });

    describe('test utilities', function () {
        it('isDateTime', () => {
            expect(isDateTime('1990-01-01')).toBeFalse();
            expect(isDateTime('1990-01-01 01-02')).toBeFalse();
            expect(isDateTime('1990-01-01 01-02-03')).toBeTrue();
        });

        it('isRange and parseRange', () => {
            expect(isRange('1990-2000')).toBeTruthy();
            expect(isRange('12-13')).toBeFalse();
        });

        it('should parseRange', () => {
            const bt = '1990-2000';
            expect(parseRange(bt).yearMin).toBe(1990);
            expect(parseRange(bt).yearMax).toBe(2000);
            expect(() => parseRange('12-13')).toThrowError(FOError);
        });
    });

    describe('comparison utilities', function () {
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

    describe('timezone utilities', function () {
        it('should localTime2utc', () => {
            expect(localTime2utc('2018-01-02 03-04-05')).toBe('2018-01-02 03-04-05');
            // Winter time
            expect(localTime2utc('2018-01-02 03-04-05', 'Europe/Brussels')).toBe('2018-01-02 02-04-05');
            // Summer time
            expect(localTime2utc('2018-07-02 03-04-05', 'Europe/Brussels')).toBe('2018-07-02 01-04-05');

            expect(localTime2utc('2018-07-02 03-04-05', 'Asia/Dhaka')).toBe('2018-07-01 21-04-05');
        });

        it('should utc2localTime', () => {
            expect(utc2localTime('2018-01-02 03-04-05')).toBe('2018-01-02 03-04-05');
            // Winter time
            expect(utc2localTime('2018-01-02 02-04-05', 'Europe/Brussels')).toBe('2018-01-02 03-04-05');
            // Summer time
            expect(utc2localTime('2018-07-02 01-04-05', 'Europe/Brussels')).toBe('2018-07-02 03-04-05');

            expect(utc2localTime('2018-07-01 21-04-05', 'Asia/Dhaka')).toBe('2018-07-02 03-04-05');
        });

    });

    describe('gps utilities', function () {
        it('coordonate2tz', () => {
            expect(coordonate2tz('50 deg 35\' 30.84" N, 5 deg 33\' 25.92" E')).toBe('Europe/Brussels');
        });
    });
});