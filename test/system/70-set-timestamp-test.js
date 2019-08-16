
const path = require('path');
const fs = require('fs-extra');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	beforeEach(() => {
		fs.moveSync(ctx.tempPath('other test/IMG_20190324_121454.jpg'), ctx.tempPath('other test/IMG_20190300_000000.jpg'));
	});

	itRun(ctx, [ 'regularize', '--set-timestamp', '--fcff' ], async (result) => {
		result.assertSuccess();

		await result.assertConsistency();

		await assert.fileExists(ctx,  'other test/2019-03 other test [IMG_20190300_000000].jpg')
			.withTS('2019-03-01')
			.done();
	});
});

