
import File from './file.js';
import {
    STATUS_FAILURE
} from '../../common/constants.js';
import { FallBackRegExp, registerRegExp } from '../register-file-types.js';

export const _map = new Map();

export default class FileUnsupported extends File {
    constructor(filePath, parent = null) {
        super(filePath, parent);
        const i = _map.has(this.extension.toLowerCase()) ? _map.get(this.extension.toLowerCase()) : 0;
        _map.set(this.extension.toLowerCase(), i + 1);
    }

    async analyse() {
        return super.analyse()
            .then(() => this.analysisAddProblem('File type is unsupported'))
            .then(() => this.notify(STATUS_FAILURE))
            .then(() => { });
    }
}

/**
 * @returns {Map<string, number>} of the unsupported file extensions
 */
export function dumpDiscoveredExtension() {
    if (_map.size > 0) {
        console.info('Found unsupported file extensions: ');
        for (const [key, value] of _map) {
            console.info(key + ': ' + value);
        }
    }
    return _map;
}

registerRegExp(FallBackRegExp, FileUnsupported, { forFiles: true });
