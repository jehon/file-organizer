
import { t } from '../test-helper.js';

import ValueConstant from '../../src/main/value-constant.js';

describe(t(import.meta), function () {
    it('should have unmodifiable properties', async function () {
        const i = new ValueConstant('test');

        expect(i.initial).toBe('test');
        expect(i.current).toBe('test');
        expect(i.expected).toBe('test');

        expect(i.isDone()).toBeTrue();
        expect(i.isModified()).toBeFalse();

        expect(() => i.expect('new')).toThrow();
        expect(() => i.currently('new')).toThrow();
    });
});
