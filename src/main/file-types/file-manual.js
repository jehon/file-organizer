
import File from './file.js';
import {
    convertedSuffix,
} from '../../common/constants.js';

import { registerRegExp, glob2regExp } from '../register-file-types.js';

export default class FileManual extends File {
    prepare() {
        super.prepare();

        this.addProblem('Manual operation needed');

        return this;
    }
}

registerRegExp([
    glob2regExp('*.doc*'),
    glob2regExp('*' + convertedSuffix + '.*')
], FileManual, { forFiles: true, forFolders: true });
