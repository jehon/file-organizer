
import File from './file.js';
import {
    STATUS_FAILURE
} from '../../common/constants.js';

import InfoProblem from '../info-problem.js';
import { registerRegExp, glob2regExp } from '../register-file-types.js';

export default class FileManual extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.analysisAddInfo(InfoProblem, 'Manual operation needed'))
            .then(() => this.notify(STATUS_FAILURE))
            .then(() => { });
    }
}

registerRegExp([
    glob2regExp('*.doc*')
], FileManual, { forFiles: true, forFolders: true });
