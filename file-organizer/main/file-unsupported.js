
const File = require('./file.js');
const {
    STATUS_FAILURE
} = require('../constants.js');
const InfoProblem = require('./info-problem.js');

const map = new Map();

class FileUnsupported extends File {
    constructor(filePath, parent = null) {
        super(filePath, parent);
        const i = map.has(this.extension.toLowerCase()) ? map.get(this.extension.toLowerCase()) : 0;
        map.set(this.extension.toLowerCase(), i + 1);
    }

    async analyse() {
        return super.analyse()
            .then(() => this.createInfo(InfoProblem, 'File type is unsupported'))
            .then(() => this.notify(STATUS_FAILURE));
    }
}

FileUnsupported.dumpDiscoveredExtension = function () {
    if (map.size > 0) {
        console.info('Found unsupported file extensions: ');
        for (const [key, value] of map) {
            console.info(key + ': ' + value);
        }
    }
    return map;
};

FileUnsupported._map = map;

module.exports = FileUnsupported;
