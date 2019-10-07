
const path = require('path');
const fs = require('fs');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');
describeAndSetup(path.basename(__filename), (ctx) => {
	beforeEach(async () => {
		fs.renameSync(ctx.tempPath('basic/2018-01-02 03-04-05 my comment [my original name].jpg'),
			ctx.tempPath('basic/2019-03-24 12-14-38 basic [IMG_20190324_121437].jpg'));
		// await ctx.listAll();
	});

	itRun(ctx, [ 'regularize', '--fcff', '--ftsfn' ], async (result) => {
		pending('Indexed is not available');

		result.assertSuccess();
		// result.dump();
		// await ctx.listAll();

		await result.assertConsistency();

		// Blocking file
		await assert.fileExists(ctx, 'basic/2019-03-24 12-14-37 basic [IMG_20190324_121437].jpg');

		// Blocked file
		await assert.fileExists(ctx, 'basic/2019-03-24 12-14-37 basic [1].jpg');

	});
});

