
const path = require('path');
const fs = require('fs');

const rootPath = (...args) => path.join((path.dirname(path.dirname(__dirname))), ...args);

// Test
exports.dataPath = (...args) => rootPath('test', 'data', ...args);
exports.tempPath = (...args) => rootPath('tmp', 'unit', ...args);

const fileFactory = require('../../file-organizer/file-factory.js');

// FileGeneric: copy to
exports.createFileGeneric = async function(subPath) {
    const fullSource = exports.dataPath(subPath);
    const newName = path.parse(fullSource).base;

    fs.copyFileSync(
        fullSource,
        path.join(exports.tempPath(), newName)
    );
    return fileFactory(path.join(exports.tempPath(), newName))
        .then(f => f.loadData());
};

exports.fileExists = async function(filePath) {
    return fs.promises.stat(filePath)
        .then(() => true)
        .catch(() => false);
};
