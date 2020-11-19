
import File from './file.js';
import {
    STATUS_FAILURE
} from '../../common/constants.js';

import InfoProblem from '../info-problem.js';
import { registerGlob } from '../register-file-types.js';

export default class FileManual extends File {
    async analyse() {
        this.addInfo(InfoProblem, 'Manual operation needed');
        await this.notify(STATUS_FAILURE);
        return;
    }
}

registerGlob([
    '*.doc*'
], FileManual);
