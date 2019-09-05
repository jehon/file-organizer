
const path = require('path');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'regularize', '--set-comment', 'test' ], async (result) => {
		result.dump();

		result.assertSuccess();

		await result.assertConsistency();

		await assert.fileExists(ctx,  '2019 test/2019-03-24 12-14-38 test [IMG_20190324_121437].jpg')
			.withComment('test')
			.done();

		await assert.fileExists(ctx,  '2019 test/2019-03-24 12-14-46 test [VID_20190324_121446].mp4')
			.done();

	});
});

