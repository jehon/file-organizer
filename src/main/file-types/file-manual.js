
import File from './file.js';
import {
    convertedSuffix,
    STATUS_FAILURE
} from '../../common/constants.js';

import { registerRegExp, glob2regExp } from '../register-file-types.js';

export default class FileManual extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.analysisAddProblem('Manual operation needed'))
            .then(() => this.notify(STATUS_FAILURE))
            .then(() => { });
    }
}

registerRegExp([
    glob2regExp('*.doc*'),
    glob2regExp('*' + convertedSuffix + '.*')
], FileManual, { forFiles: true, forFolders: true });
