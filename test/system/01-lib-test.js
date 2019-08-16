

const path = require('path');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'dump' ], async (result) => {
		result.assertSuccess();

		// This would test concistency: :-)
		// require('fs-extra').removeSync(ctx.tempPath('2019 test/1.jpg'));

		await result.assertConsistency();

		await assert.fileExists(ctx, 'other test/1.jpeg')
			.withTS('2018-01-02 03-04-05')
			.withComment('my comment')
			.done();

		await assert.fileExists(ctx, 'other test/2.jpeg')
			.withTS('')
			.withComment('')
			.done();
	});
});
