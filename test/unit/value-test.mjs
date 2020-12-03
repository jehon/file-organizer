
import { t } from '../test-helper.js';

import Value from '../../src/main/value.js';

describe(t(import.meta), function () {
    it('should have properties and methods', async function () {
        const v = new Value('test');

        expect(v.initial).toBe('test');
        expect(v.current).toBe('test');
        expect(v.expected).toBe('test');

        v.expect('new');

        expect(v.isDone()).toBeFalse();
        expect(v.isModified()).toBeFalse();

        v.fix();

        expect(v.isDone()).toBeTrue();
        expect(v.isModified()).toBeTrue();
    });

    it('should fire events', function (done) {
        const v = new Value('test');

        v.onExpectedChanged(() => {
            expect(v.expected).toBe(123);
            done();
        });

        v.expect(123);
    });
});
