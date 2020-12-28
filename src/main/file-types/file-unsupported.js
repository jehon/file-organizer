
import File from './file.js';
import { FallBackRegExp, registerRegExp } from '../register-file-types.js';

export const _map = new Map();

export default class FileUnsupported extends File {
    constructor(filePath) {
        super(filePath);

        const ext = this.get(File.I_EXTENSION).current.toLowerCase();
        const i = _map.has(ext) ? _map.get(ext) : 0;
        _map.set(ext, i + 1);
    }

    prepare() {
        super.prepare();
        this.addProblem('File type is unsupported');

        return this;
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
