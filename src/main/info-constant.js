
import Info from './info.js';
import {
    STATUS_SUCCESS
} from '../common/constants.js';

export default class InfoConstant extends Info {
    static getNotifyProperties() {
        return super.getNotifyProperties().concat(['value']);
    }

    constructor(title, value) {
        super(title, value);
        this.notify(STATUS_SUCCESS);
    }
}
