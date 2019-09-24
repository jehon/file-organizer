

const path = require('path');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'dump' ], async (result) => {
		result.assertSuccess();

		// This would test concistency: :-)
		// require('fs-extra').removeSync(ctx.tempPath('2019 test/1.jpg'));

		await result.assertConsistency();

		await assert.untouched(ctx, 'basic/IMG_20190324_121437.jpg');

		// Legacy

		await assert.fileExists(ctx, '2019 test/1.jpeg')
			.withTS('')
			.withComment('')
			.done();

		await assert.fileExists(ctx, '2019 test/1.jpeg')
			.withTS()
			.withComment()
			.done();
	});
});
