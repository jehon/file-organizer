
const path = require('path');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'regularize', '--guess-comment' ], async (result) => {
		result.assertSuccess();

		await result.assertConsistency();

		await assert.fileExists(ctx, '2019 test/2018-01-02 03-04-05 my incoherent comment [my original name].jpg') // # Not changed: bad parent
			.done();

		await assert.fileExists(ctx, '2019 test/2019-03-24 12-14-38 test [IMG_20190324_121437].jpg')
			.done();
		await assert.fileExists(ctx, '2019 test/2019-03-24 12-14-46 test [VID_20190324_121446].mp4')
			.done();

		await assert.fileExists(ctx, 'other test/2018-01-02 03-04-05 my comment [1].jpg')
			.done();
		await assert.fileExists(ctx, 'other test/2018-01-02 03-04-05 my comment [my original name].jpg')
			.done();
		await assert.fileExists(ctx, 'other test/2019-03-24 12-14-55 other test [IMG_20190324_121454].jpg')
			.done();
	});
});

