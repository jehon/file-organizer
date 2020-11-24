
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

    isModified() {
        return this.#current != this.#initial;
    }

    isDone() {
        return this.#expected == this.#current;
    }
}