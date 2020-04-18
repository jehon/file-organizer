
const path = require('path');
const fs = require('fs');

const File = require('../../file-organizer/main/file.js');
const Item = require('../../file-organizer/main/item.js');
const rootPath = (...args) => path.join((path.dirname(path.dirname(__dirname))), ...args);

// Test
exports.dataPath = (...args) => rootPath('test', 'data', ...args);
exports.tempPath = (...args) => rootPath('tmp', 'unit', ...args);

const fileFactory = require('../../file-organizer/file-factory.js');

// FileGeneric: copy to
exports.createFileGeneric = async function (subPath) {
    const fullSource = exports.dataPath(subPath);
    const newName = path.parse(fullSource).base;

    fs.copyFileSync(
        fullSource,
        path.join(exports.tempPath(), newName)
    );
    return fileFactory(path.join(exports.tempPath(), newName))
        .then(f => f.loadData());
};

exports.createFileFrom = async function (subPath) {
    const f = await exports.createFileGeneric(subPath);
    if (f instanceof File) {
        return f;
    }
    return new File(f.getPath());
};

exports.fileExists = async function (filePath) {
    return fs.promises.stat(filePath)
        .then(() => true)
        .catch(() => false);
};

exports.getNotifyCallsForFile = function (f, i = false) {
    // When creating a file, it notifies the creation of the parent's
    // we does need to filter on this
    const list = File.prototype.notify.calls.all()
        .filter(data => data.object.id == f.id)
        .map(data => data.args);
    if (i === false) {
        return list;
    }
    return list[i];
};

exports.getNotifyCallsForItem = function (f, i = false) {
    // When creating a file, it notifies the creation of the parent's
    // we does need to filter on this
    const list = Item.prototype.notify.calls.all()
        .filter(data => data.object.id == f.id)
        .map(data => data.args)
    if (i === false) {
        return list;
    }
    return list[i];
};


exports.getStatusHistoryForItem = function (i) {
    return exports.getNotifyCallsForItem(i)
        .map(args => args[0])
        .filter(a => a);
}
