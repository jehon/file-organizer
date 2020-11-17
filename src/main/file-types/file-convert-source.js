
import File from '../../../file-organizer/main/file.js';
import {
    STATUS_FAILURE,
    convertedSuffix
} from '../../common/constants.js';
import InfoProblem from '../info-problem.js';
import { registerGlob } from '../register-file-types.js';

export default class FileConvertSource extends File {
    async analyse() {
        return super.analyse()
            .then(() => this.addInfo(InfoProblem, 'Please remove the source file after verifying the conversion'))
            .then(() => this.notify(STATUS_FAILURE))
            .then(() => { });
    }
}

registerGlob([
    '#recycle',
    '@eaDir',
    // TODO ??? '.*',
    '*' + convertedSuffix + '.*'
], FileConvertSource);
