
import File from '../../../file-organizer/main/file.js';
import {
    STATUS_FAILURE
} from '../../common/constants.js';

import InfoProblem from '../info-problem.js';
import { registerGlob } from '../register-file-types.js';

export default class FileManual extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.addInfo(InfoProblem, 'Manual operation needed'))
            .then(() => this.notify(STATUS_FAILURE))
            .then(() => { });
    }
}

registerGlob([
    '*.doc*'
], FileManual);
