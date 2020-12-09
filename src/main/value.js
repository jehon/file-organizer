
// /**
//  * Thanks to https://stackoverflow.com/a/36871498/1954789
//  */
// class ExtensibleFunction extends Function {
//     constructor(f) {
//         super();
//         return Object.setPrototypeOf(f, new.target.prototype);
//     }
// }

import EventEmitter from '../../node_modules/eventemitter3/index.js';

export default class Value extends EventEmitter {
    static getNotifyProperties() {
        return ['currentValue', 'initialValue', 'expectedValue'];
    }

    /** @type {*} */
    #initial

    /** @type {*} */
    #current

    /** @type {*} */
    #expected

    constructor(value) {
        super();
        // super(() => this.current);
        this.#initial = value;
        this.#current = value;
        this.#expected = value;
    }

    get initial() {
        return this.#initial;
    }

    get expected() {
        return this.#expected;
    }

    get current() {
        return this.#current;
    }

    // set current(cur) {
    //     this.#current = cur;
    // }

    // /**
    //  * Set the current value
    //  *
    //  * @param {*} cur expected
    //  */
    // currently(cur) {
    //     if (this.equals(this.#current, cur)) {
    //         return;
    //     }
    //     this.#current = cur;
    //     this.emit('currentChanged', cur);
    // }

    /**
     * Set the expected value
     *
     * @param {*} expect expected
     * @returns {Value} to be chained
     */
    expect(expect) {
        if (this.equals(this.#expected, expect)) {
            return;
        }
        this.#expected = expect;
        this.emit('expectedChanged', expect);
        return this;
    }

    /**
     * Test if someone did modify the (current) value
     *
     * @returns {boolean} true if something has been done
     */
    isModified() {
        return !this.equals(this.#current, this.#initial);
    }

    /**
     * Test if some action need to be done
     *
     * @returns {boolean} true if nothing to be done
     */
    isDone() {
        return this.equals(this.#expected, this.#current);
    }

    /**
     * @param {*} a as the first element
     * @param {*} b as the second element
     * @returns {boolean} true if equals
     */
    equals(a, b) {
        if (typeof (a) == 'object' && typeof (b) == 'object'
            && a && b // avoid null
            && typeof (a.equals) == 'function') {
            return a.equals(b);
        }

        return a == b;
    }

    /**
     * Fix the value by setting the current value to the expected value
     * isDone is true
     *
     * @param {*} v the value to wich it resolve, expected otherwise
     * @returns {Value} this for chaining
     */
    fix(v = this.expected) {
        this.#current = this.#expected = v;
        this.emit('currentChanged', this.#current);
        return this;
    }

    toJSON() {
        return {
            className: this.constructor.name,
            initial: this.initial,
            current: this.current,
            expected: this.expected,
            // TODO: not definitive
            isModified: this.isModified(),
            isDone: this.isDone()
        };
    }

    onExpectedChanged(cb) {
        this.on('expectedChanged', cb);
        return this;
    }
}