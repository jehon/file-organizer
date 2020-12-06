
import { t } from '../test-helper.js';

import ValueCalculated from '../../src/main/value-calculated.js';
import Value from '../../src/main/value.js';

describe(t(import.meta), function () {
    it('should have properties and methods', async function () {
        const vb = new Value('test');
        const v = new ValueCalculated(vb, (val) => val + '_calc');

        expect(v.initial).toBe('test_calc');
        expect(v.current).toBe('test_calc');
        expect(v.expected).toBe('test_calc');

        expect(v.isDone()).toBeTrue();
        expect(v.isModified()).toBeFalse();

        expect(() => v.fix()).toThrow();

        //
        // We change the basis
        // now, the basis is not ready anymore
        //

        vb.expect('new');

        expect(vb.isDone()).toBeFalse();
        expect(v.expected).toBe('test_calc');
        expect(v.isDone()).toBeFalse();
        expect(v.isModified()).toBeFalse();

        //
        // We fix the basis
        // now the expected is not in line anymore
        //

        vb.fix();
        expect(vb.current).toBe('new');

        expect(v.current).toBe('new_calc');
        expect(v.expected).toBe('test_calc');
        expect(v.isDone()).toBeFalse();
        expect(v.isModified()).toBeTrue();


        //
        // We set the correct value in the basis and in expected
        // Now everything is ok
        //
        v.expect('something_calc');
        vb.expect('something');
        vb.fix();

        expect(vb.current).toBe('something');

        expect(v.current).toBe('something_calc');
        expect(v.expected).toBe('something_calc');
        expect(v.isDone()).toBeTrue();
        expect(v.isModified()).toBeTrue();

    });
});
