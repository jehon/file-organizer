
const Item = require('./item.js');
const {
    STATUS_ANALYSING,
    STATUS_ANALYSED,
    STATUS_NEED_WORK,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../../constants.js');

module.exports = class InfoValue extends Info {
    static getNotifyProperties() {
        return super.getNotifyProperties().concat(['value', 'initialValue', 'expectedValue']);
    }

    constructor(title, value, parent) {
        super(title, parent);
        this.value = value;
        this.initialValue = value;
        this.expectedValue = value;
        this.notify(STATUS_ANALYSING);
    }

    setValueOk() {
        this.notify(STATUS_ANALYSED);
    }

    setExpectedValue(exp) {
        this.expectedValue = exp;
        this.notify(STATUS_NEED_WORK);
    }

    setActualValue(act) {
        this.actualValue = act;
    }
};
