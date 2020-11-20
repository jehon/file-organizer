
import File from './file.js';
import {
    STATUS_FAILURE,
    convertedSuffix
} from '../../common/constants.js';
import InfoProblem from '../info-problem.js';
import { registerRegExp, glob2regExp } from '../register-file-types.js';

export default class FileConvertSource extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.analysisAddInfo(InfoProblem, 'Please remove the source file after verifying the conversion'))
            .then(() => this.notify(STATUS_FAILURE))
            .then(() => { });
    }
}

registerRegExp([
    glob2regExp('#recycle'),
    glob2regExp('@eaDir'),
    glob2regExp('*' + convertedSuffix + '.*')
], FileConvertSource, { forFiles: true });
