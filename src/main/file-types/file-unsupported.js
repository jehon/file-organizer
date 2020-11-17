
import File from '../../../file-organizer/main/file.js';
import {
    STATUS_FAILURE
} from '../../common/constants.js';
import InfoProblem from '../info-problem.js';
import { registerFallback } from '../register-file-types.js';

const map = new Map();

export default class FileUnsupported extends File {
    constructor(filePath, parent = null) {
        super(filePath, parent);
        const i = map.has(this.extension.toLowerCase()) ? map.get(this.extension.toLowerCase()) : 0;
        map.set(this.extension.toLowerCase(), i + 1);
    }

    async analyse() {
        return super.analyse()
            .then(() => this.addInfo(InfoProblem, 'File type is unsupported'))
            .then(() => this.notify(STATUS_FAILURE))
            .then(() => { });
    }
}

/**
 * @returns {Map<string, number>} of the unsupported file extensions
 */
export function dumpDiscoveredExtension() {
    if (map.size > 0) {
        console.info('Found unsupported file extensions: ');
        for (const [key, value] of map) {
            console.info(key + ': ' + value);
        }
    }
    return map;
}

export const _map = map;

registerFallback(FileUnsupported);
