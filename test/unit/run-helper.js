
const fs = require('fs');
const { tempPath } = require('./helpers.js');

const options = require('../../file-organizer/options.js');
options.withFileSummary = false;
options.withStats = false;
options.headless = true;

// Clean up the temp folder !
beforeAll(async () => {
	return fs.promises.rmdir(tempPath(), { recursive: true })
		.then(() => fs.promises.mkdir(tempPath(), { recursive: true }));
});
