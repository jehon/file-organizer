
const path = require('path');
const fs = require('fs-extra');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	beforeEach(() => {
		fs.moveSync(ctx.tempPath('basic/2018-01-02 03-04-05 my comment [my original name].jpg'),
			ctx.tempPath('basic/2017-01-02 03-04-09 something else [my original name].jpg'));
	});
	itRun(ctx, [ 'regularize' ], async (result) => {
		result.assertSuccess();
		await result.assertConsistency();

		async function t(f)  {
			return assert.untouched(ctx, f);
		}

		// They don't have a comment, so they are faulty
		await t('basic/DSC_2506.MOV');
		await t('basic/IMG_20190324_121437.jpg');
		await t('basic/VID_20190324_121446.mp4');
		// Modified in beforeEach, resetted by the run
		await t('basic/2018-01-02 03-04-05 my comment [my original name].jpg');

		await t('2019 test/1.jpg');
	});
});
