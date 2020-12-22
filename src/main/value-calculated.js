
// /**
//  * Thanks to https://stackoverflow.com/a/36871498/1954789
//  */
// class ExtensibleFunction extends Function {
//     constructor(f) {
//         super();
//         return Object.setPrototypeOf(f, new.target.prototype);
//     }
// }

import ValueConstant from './value-constant.js';

export default class ValueCalculated extends ValueConstant {
    static getNotifyProperties() {
        return ['currentValue', 'initialValue', 'expectedValue'];
    }

    /** @type {*} */
    #calculatedExpected

    /** @type {module:/src/main/Value} */
    #basis

    /** @type {function(any):any} */
    #formula

    /**
     * @param {module:/src/main/Value} value on which the formula is based
     * @param {function(any):any} formula to calculate the value
     */
    constructor(value, formula) {
        super(value.initial);
        this.#basis = value;
        this.#formula = formula;
        /*
         * TODO: here is a great question
         *
         *   should we instantiate on "initial" or on "expected" ?
         *   expected is more up-to-date, but may be not calculated yet
         */
        this.#calculatedExpected = this.#formula(this.#basis.expected);
    }

    get initial() {
        return this.#formula(this.#basis.initial);
    }

    get current() {
        return this.#formula(this.#basis.current);
    }

    get expected() {
        return this.#calculatedExpected;
    }

    expect(expect, message = null) {
        if (message) {
            this.messages.push(message);
        }
        this.#calculatedExpected = expect;
        this.emit('expectedChanged', expect);
        return this;
    }

    fix(_val) {
        // TODO: find out what is the good behavior
        // Mock to allow fixing this value
        this.#calculatedExpected = this.current;
        return this;
    }

    /**
     * Test if some action need to be done
     *
     * @returns {boolean} true if nothing to be done
     */
    isDone() {
        // return this.#basis.isDone()
        return this.equals(this.current, this.#calculatedExpected);
    }
}