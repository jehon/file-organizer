
const path = require('path');
const fs = require('fs-extra');

const rootPath = (...args) => path.join((path.dirname(path.dirname(__dirname))), ...args);

// Test
exports.dataPath = (...args) => rootPath('test', 'data', ...args);
exports.tempPath = (...args) => rootPath('tmp', 'unit', ...args);

const FileFactory = require('../../file-organizer/file-factory.js');

// FileGeneric: copy to
exports.createFileGeneric = async function(subPath, { folder, newName, factory } = {
	folder: exports.tempPath(),
	newName: subPath,
	factory: FileFactory
}) {
	fs.copySync(
		exports.dataPath(subPath),
		folder + path.sep + newName
	);
	return await factory(path.join(folder, newName)).loadData();
};

// Clean up the temp folder !
beforeAll(function(done) {
	fs.emptyDir(exports.tempPath()) // fs-extra dependency
		.then(done);
});
