
import Info from './info.js';
import {
    STATUS_ANALYSING,
    STATUS_SUCCESS,
    STATUS_NEED_ACTION,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE,
} from '../common/constants.js';

export default class InfoValue extends Info {
    static getNotifyProperties() {
        return super.getNotifyProperties().concat(['value', 'initialValue', 'expectedValue']);
    }

    constructor(title, value) {
        super(title, value);
        this.notify(STATUS_ANALYSING);
    }

    setExpectedValue(exp) {
        this.expectedValue = exp;
        if (this.expectedValue == this.value) {
            return this.notify(STATUS_SUCCESS);
        }
        return this.notify(STATUS_NEED_ACTION);
    }

    setActionOk() {
        this.value = this.expectedValue;
        return this.notify(STATUS_ACTED_SUCCESS);
    }

    setActionFixedIt() {
        this.value = this.expectedValue;
        this.notify(STATUS_ACTED_SUCCESS);
    }

    setActionFailed() {
        this.notify(STATUS_ACTED_FAILURE);
    }
}
