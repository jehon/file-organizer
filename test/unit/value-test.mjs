
import { t } from '../test-helper.js';

import Value from '../../src/main/value.js';
import { Timestamp } from '../../file-organizer/timestamp.js';

describe(t(import.meta), function () {
    it('should have properties and methods', async function () {
        const v = new Value('test');

        expect(v.initial).toBe('test');
        expect(v.current).toBe('test');
        expect(v.expected).toBe('test');

        v.expect('new');

        expect(v.isDone()).toBeFalse();
        expect(v.isModified()).toBeFalse();
        expect(v.messages.length).toBe(0);

        v.expect('new', 'because');
        expect(v.messages.length).toBe(0);

        v.expect('new2', 'because');
        expect(v.messages.length).toBe(1);

        v.fix();

        expect(v.isDone()).toBeTrue();
        expect(v.isModified()).toBeTrue();
    });

    it('should fire events', function (done) {
        const v = new Value('test');

        v.onExpectedChanged((v2) => {
            expect(v2).toBe(v);
            if (v.expected == 'test') {
                // initial call
                return;
            }
            expect(v.expected).toBe(123);
            done();
        });

        v.expect(123);
    });

    it('should equals', function () {
        const v = new Value('test');

        expect(v.equals('a', 'a')).toBeTrue();
        expect(v.equals('a', 'b')).toBeFalse();
        expect(v.equals(null, null)).toBeTrue();

        const t1 = new Timestamp('2020-02-01');
        const t1b = new Timestamp('2020-02-01');
        const t2 = new Timestamp('1999-01-01');
        expect(v.equals(t1, t1)).toBeTrue();
        expect(v.equals(t1, t1b)).toBeTrue();
        expect(v.equals(t1, t2)).toBeFalse();

        expect(v.equals(t1, null)).toBeFalse();
        expect(v.equals(null, t1)).toBeFalse();

        expect(v.equals(t1, 1)).toBeFalse();
        expect(v.equals(1, t1)).toBeFalse();
    });
});
