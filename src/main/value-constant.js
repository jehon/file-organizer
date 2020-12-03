
// /**
//  * Thanks to https://stackoverflow.com/a/36871498/1954789
//  */
// class ExtensibleFunction extends Function {
//     constructor(f) {
//         super();
//         return Object.setPrototypeOf(f, new.target.prototype);
//     }
// }

import Value from './value.js';

export default class ValueConstant extends Value {
    static getNotifyProperties() {
        return ['currentValue', 'initialValue'];
    }

    constructor(value) {
        super(value);
    }

    /**
     * @override
     * @param {any} _val unused
     */
    fix(_val) {
        throw new Error('Constant value');
    }

    expect(_val) {
        throw new Error('Constant value');
    }
}