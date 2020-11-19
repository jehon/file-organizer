
import InfoValue from './info-value.js';
import {
    STATUS_FAILURE
} from '../common/constants.js';

export default class InfoProblem extends InfoValue {
    constructor(title, value, expected) {
        super(title, value);
        this.setExpectedValue(expected);
        this.notify(STATUS_FAILURE);
    }
}
