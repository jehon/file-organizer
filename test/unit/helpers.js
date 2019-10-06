
const path = require('path');
const fs = require('fs');

const rootPath = (...args) => path.join((path.dirname(path.dirname(__dirname))), ...args);

// Test
exports.dataPath = (...args) => rootPath('test', 'data', ...args);
exports.tempPath = (...args) => rootPath('tmp', 'unit', ...args);

const fileFactory = require('../../file-organizer/file-factory.js');

// FileGeneric: copy to
exports.createFileGeneric = async function(subPath, { folder, newName } = {
	folder: exports.tempPath(),
	newName: subPath,
}) {
	fs.copyFileSync(
		exports.dataPath(subPath),
		folder + path.sep + newName
	);
	return fileFactory(path.join(folder, newName))
		.then(f => f.loadData());
};

// Clean up the temp folder !
beforeAll(async () => {
	return fs.promises.rmdir(exports.tempPath(), { recursive: true })
		.then(() => fs.promises.mkdir(exports.tempPath(), { recursive: true }));
});
