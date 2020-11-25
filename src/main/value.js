
// /**
//  * Thanks to https://stackoverflow.com/a/36871498/1954789
//  */
// class ExtensibleFunction extends Function {
//     constructor(f) {
//         super();
//         return Object.setPrototypeOf(f, new.target.prototype);
//     }
// }

export default class Value {
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
        // super(() => this.current);
        this.#initial = value;
        this.current = value;
        this.expected = value;
    }

    get initial() {
        return this.#initial;
    }

    get expected() {
        return this.#expected;
    }

    set expected(exp) {
        this.#expected = exp;
    }

    get current() {
        return this.#current;
    }

    set current(cur) {
        this.#current = cur;
    }

    /**
     * Test if someone did modify the (current) value
     *
     * @returns {boolean} true if something has been done
     */
    isModified() {
        return this.#current != this.#initial;
    }

    /**
     * Test if some action need to be done
     *
     * @returns {boolean} true if nothing to be done
     */
    isDone() {
        return this.#expected == this.#current;
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
        return this;
    }
}