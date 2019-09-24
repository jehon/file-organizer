
const path = require('path');
const fs = require('fs-extra');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	beforeEach(() => {
		fs.moveSync(ctx.tempPath('basic/2018-01-02 03-04-05 my comment [my original name].jpg'),
			ctx.tempPath('basic/2019-03-24 12-14-38 basic [IMG_20190324_121437].jpg'));
	});

	itRun(ctx, [ 'regularize', '--fcff' ], async (result) => {
		result.assertSuccess();

		await result.assertConsistency();

		function t(fold, fnew)  {
			if (!fnew) {
				fnew = fold;
			}
			return assert.fileExists(ctx, fnew).from(fold).untouched();
		}

		// Blocking file
		await t('basic/2018-01-02 03-04-05 my comment [my original name].jpg',
			'basic/2018-01-02 03-04-05 basic [IMG_20190324_121437].jpg');

		// Blocked file
		await t('basic/IMG_20190324_121437.jpg');

	});
});
