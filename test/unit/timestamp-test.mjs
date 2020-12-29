
import { t } from './help-functions.mjs';

import { regexps, parseFilename } from '../../src/main/timestamp.js';

/**
 * @param {string} originalString to be parsed
 * @param {string} type to be matched
 * @param {string} time to be matched
 * @param {object} extra to be matched
 * @property {string?} title to be matched
 * @property {string?} qualif to be matched
 */
function isA(originalString, type, time = originalString, extra = {}) {
    const parsed = parseFilename(originalString);
    expect(parsed.type)
        .withContext(`${originalString}: Interpreted wrongly as`)
        .toBe(type);

    expect(parsed.time)
        .withContext(`${originalString}: Not correctly interpreted as TS`)
        .toBe(time);

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
            isA('2018', 'final', '2018');
            isA('2018-09-08', 'final', '2018-09-08');
            isA('2018-09-08 13-14-15', 'final', '2018-09-08 13-14-15');

            isA('2018-09-08 13-14-15 test', 'final', '2018-09-08 13-14-15');

            isA('2018-09-08 13-14-15 [file]', 'final', '2018-09-08 13-14-15',
                {
                    qualif: 'file',
                    title: ''
                });

            isA('2018-09-08 13-14-15 test [file]', 'final', '2018-09-08 13-14-15',
                {
                    qualif: 'file',
                    title: 'test'
                });

            isA('2018-09-08 test [file]', 'final', '2018-09-08',
                {
                    qualif: 'file',
                    title: 'test'
                });

            // Year only
            isA('2018 test [file]', 'final', '2018',
                {
                    qualif: 'file',
                    title: 'test'
                });

            // Year only
            isA('2018 test', 'final', '2018',
                {
                    qualif: '',
                    title: 'test'
                });

            isA('2015-12-11 02-03-55 Bangladesh - A la mer', 'final', '2015-12-11 02-03-55',
                {
                    qualif: '',
                    title: 'Bangladesh - A la mer'
                });

            isA('2019-03-24 12-14-46', 'final', '2019-03-24 12-14-46');

            // Year only
            isA('2018 bonjour 2019', 'final', '2018',
                {
                    qualif: '',
                    title: 'bonjour 2019'
                });

            // Year-month only
            isA('2018-01 bonjour 2019', 'final', '2018-01',
                {
                    qualif: '',
                    title: 'bonjour 2019'
                });

            // Year-month-day only
            isA('2018-01-15 bonjour 2019', 'final', '2018-01-15',
                {
                    qualif: '',
                    title: 'bonjour 2019'
                });
        });

        it('should parse old elements', function () {
            isA('1980', 'final', '1980');
            isA('1980-01', 'final', '1980');
            isA('1980-02', 'final', '1980-02');
            isA('1980-02-01', 'final', '1980-02');
            isA('1980-02-03', 'final', '1980-02-03');
        });

        it('should parse timestamps elements', function () {
            // With timezone
            isA('2019:03:24 12:14:46+01:00', 'final', '2019-03-24 12-14-46');
        });

        it('should parse canon pictures and movies', function () {
            isA('DSC_1234',
                'raw8_3', '',
                {
                    qualif: 'DSC_1234',
                    title: ''
                });
        });

        it('should parse "android" elements', function () {
            isA('VID_20180102_030405', 'android', '2018-01-02 03-04-05',
                {
                    qualif: 'VID_20180102_030405',
                    title: ''
                });

            isA('IMG_20180102_030405', 'android', '2018-01-02 03-04-05',
                {
                    qualif: 'IMG_20180102_030405',
                    title: ''
                });

            isA('IMG-20180915-WA0001', 'whatsapp', '2018-09-15',
                {
                    qualif: 'IMG-20180915-WA0001'
                });

            expect(regexps.android.test('IMG_20180304_050607')).toBeTruthy();
            expect(regexps.android.test('VID_20121215_111704')).toBeTruthy();
        });

        it('should parse "screen" elements', function () {
            isA('20150306_153340', 'screen', '2015-03-06 15-33-40',
                {
                    qualif: '20150306_153340',
                    title: '',
                });

            isA('20150306_153340 Cable internet dans la rue', 'screen', '2015-03-06 15-33-40',
                {
                    qualif: '20150306_153340',
                    title: 'Cable internet dans la rue',
                });
        });

        it('should parse "yearRange" elements', function () {
            isA('2015-2016', 'yearRange', '2015-2016', {
                title: ''
            });

            isA('2015-2016 with title', 'yearRange', '2015-2016', {
                title: 'with title'
            });

            isA('2015-2016 with title [brol]', 'yearRange', '2015-2016', {
                title: 'with title',
                qualif: 'brol'
            });
        });

        it('should parse minimal format', function () {
            isA('canon', 'minimal', '',
                { title: 'canon' });

            isA('canon brol', 'minimal', '',
                { title: 'canon brol' });

            isA('brol - machin', 'minimal', '',
                {
                    title: 'brol - machin'
                });

            isA('canon brol [truc]', 'minimal', '',
                {
                    title: 'canon brol',
                    qualif: 'truc'
                });

        });

        it('should detect invalid formats', function () {
            isA('2018-01-02-03', 'invalid', '',
                {
                    title: '2018-01-02-03'
                });

            isA('brol 2018-01-02 machin',
                'invalid', '',
                {
                    title: 'brol 2018-01-02 machin'
                });
        });
    });
});

