
import { t } from '../test-helper.js';

import Value from '../../src/main/value.js';

describe(t(import.meta), function () {
    it('should have a correct state machine', async function () {
        const i = new Value('test');

        expect(i.initial).toBe('test');
        expect(i.current).toBe('test');
        expect(i.expected).toBe('test');

        i.expected = 'new';

        expect(i.isDone()).toBeFalse();
        expect(i.isModified()).toBeFalse();

        i.fix();

        expect(i.isDone()).toBeTrue();
        expect(i.isModified()).toBeTrue();
    });
});
