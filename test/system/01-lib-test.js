

const path = require('path');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'dump' ], async (result) => {
		result.assertSuccess();

		// This would test concistency: :-)
		// require('fs-extra').removeSync(ctx.tempPath('2019 test/1.jpg'));

		await result.assertConsistency();

		await assert.untouched(ctx, 'basic/DSC_2506.MOV');

		await assert.fileExists(ctx, 'basic/DSC_2506.MOV')
			.withTS('2019-09-19 07-48-25')
			.withComment('')
			.done();

		await assert.fileExists(ctx, 'basic/DSC_2506.MOV')
			.withTS()
			.withComment()
			.done();
	});
});
