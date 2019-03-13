
const path = require('path');
const fs = require('fs-extra');

const rootPath = (...args) => path.join((path.dirname(path.dirname(__dirname))), ...args);

// Test
exports.dataPath = (...args) => rootPath('tests', 'data', ...args);
exports.tempPath = (...args) => rootPath('tests', 'tmp', ...args);

const FileFactory = require('../../file-organizer/file-factory.js');

// FileGeneric: copy to
exports.createFileGeneric = function(subPath, { folder, newName, factory } = {
	folder: exports.tempPath(),
	newName: subPath,
	factory: FileFactory
}) {
	fs.copySync(
		exports.dataPath(subPath),
		folder + path.sep + newName
	);
	return factory(path.join(folder, newName));
};

// Clean up the temp folder !
beforeAll(function(done) {
	fs.emptyDir(exports.tempPath()) // fs-extra dependency
		.then(done);
});
