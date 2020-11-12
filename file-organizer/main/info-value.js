
const Info = require('./info.js');
const {
    STATUS_ANALYSING,
    STATUS_NEED_ACTION,
    STATUS_ACTED_SUCCESS,
} = require('../constants.js');

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
        this.notify(STATUS_ACTED_SUCCESS);
    }

    setExpectedValue(exp) {
        this.expectedValue = exp;
        this.notify(STATUS_NEED_ACTION);
    }

    setActualValue(act) {
        this.actualValue = act;
        this.notify(STATUS_ACTED_SUCCESS);
    }
};
