
import { t } from './help-functions.mjs';

import ValueCalculated from '../../src/main/value-calculated.js';
import Value from '../../src/main/value.js';

describe(t(import.meta), function () {
    it('should have properties and methods', async function () {
        const basis = new Value('test');
        const calc = new ValueCalculated(basis, (val) => val + '_calc');

        expect(calc.initial).toBe('test_calc');
        expect(calc.current).toBe('test_calc');
        expect(calc.expected).toBe('test_calc');

        expect(calc.isDone()).toBeTrue();
        expect(calc.isModified()).toBeFalse();

        // expect(() => v.fix()).toThrow();

        //
        // We change the basis
        // now, the basis is not ready anymore
        //

        basis.expect('new');
        expect(basis.current).toBe('test');
        expect(basis.expected).toBe('new');
        expect(basis.isDone()).toBeFalse();

        expect(calc.current).toBe('test_calc');
        expect(calc.expected).toBe('test_calc');
        expect(calc.isDone()).toBeTrue();
        expect(calc.isModified()).toBeFalse();

        //
        // We fix the basis
        // now the expected is not in line anymore
        //

        basis.fix();
        expect(basis.current).toBe('new');
        expect(basis.expected).toBe('new');
        expect(basis.isDone()).toBeTrue();

        expect(calc.current).toBe('new_calc');
        expect(calc.expected).toBe('test_calc');
        expect(calc.isDone()).toBeFalse();
        expect(calc.isModified()).toBeTrue();


        //
        // We set the correct value in the basis and in expected
        // Now everything is ok
        //
        basis.expect('something');
        basis.fix();
        expect(basis.current).toBe('something');
        expect(basis.expected).toBe('something');

        expect(calc.current).toBe('something_calc');
        expect(calc.expected).toBe('test_calc');

        calc.expect('something_calc');
        expect(calc.expected).toBe('something_calc');
        expect(calc.isDone()).toBeTrue();
        expect(calc.isModified()).toBeTrue();
    });
});
