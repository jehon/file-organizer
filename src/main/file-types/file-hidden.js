
import File from './file.js';
import { registerGlob, registerRegex } from '../register-file-types.js';

export default class FileHidden extends File {
    async analyse() {
        return super.analyse();
    }
}

registerGlob([
    '#recycle',
    '@eaDir',
    '.*',
], FileHidden);

registerRegex(/^[^.]+$/i, FileHidden);
