
import Info from '../../file-organizer/main/info.js';
import {
    STATUS_FAILURE
} from '../common/constants.js';

export default class InfoProblem extends Info {
    constructor(title, parent) {
        super(title, parent);
        this.notify(STATUS_FAILURE);
    }
}
