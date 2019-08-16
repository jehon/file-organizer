
const path = require('path');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'regularize' ], async (result) => {
		result.assertSuccess();

		await result.assertConsistency();

		// bad parent
		await assert.fileExists(ctx, '2019 test/2018-01-02 03-04-05 my incoherent comment [my original name].jpg')
			.done();
		// No comment
		await assert.fileExists(ctx, '2019 test/IMG_20190324_121437.jpg')
			.done();

		// No comment
		await assert.fileExists(ctx, '2019 test/VID_20190324_121446.mp4')
			.done();

		await assert.fileExists(ctx, 'other test/2018-01-02 03-04-05 my comment [1].jpg')
			.done();
		await assert.fileExists(ctx, 'other test/2018-01-02 03-04-05 my comment [my original name].jpg')
			.done();
		await assert.fileExists(ctx, 'other test/IMG_20190324_121454.jpg')
			.done();
	});
});
