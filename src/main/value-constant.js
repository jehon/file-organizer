
import Value from './value.js';

export default class ValueConstant extends Value {
    static getNotifyProperties() {
        return ['initialValue'];
    }

    /**
     * @override
     */
    fix(_val) {
        // throw new Error('Constant value');
        return this;
    }

    /**
     * @override
     */
    expect(_val) {
        throw new Error('Constant value');
    }
}