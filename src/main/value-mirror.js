
import ValueCalculated from './value-calculated.js';

export default class ValueMirror extends ValueCalculated {

    fix(v) {
        this.basis.fix(v);
        return this;
    }

    expect(_v) {
        throw 'Could not expect on ValueCalculated';
        // return this;
    }

    get expected() {
        return this.formula(this.basis.expected);
    }

    isDone() {
        return this.equals(this.current, this.expected);
    }
}