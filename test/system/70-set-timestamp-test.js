
const path = require('path');
const fs = require('fs-extra');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	beforeEach(() => {
		fs.moveSync(ctx.tempPath('basic/2018-01-02 03-04-05 my comment [my original name].jpg'),
			ctx.tempPath('basic/2017-01-02 03-04-09 my comment [my original name].jpg'));
	});

	itRun(ctx, [ 'regularize', '--set-timestamp', '--fcff' ], async (result) => {
		result.assertSuccess();

		await result.assertConsistency();

		async function t(f, fts, ts)  {
			return assert.fileExists(ctx, fts ? fts : f)
				.from(f)
				.withTS(ts)
				.withComment('basic')
				.done();
		}

		await assert.untouched(ctx, 'basic/DSC_2506.MOV');
		await t('basic/IMG_20190324_121437.jpg', 'basic/2019-03-24 12-14-37 basic [IMG_20190324_121437].jpg', '2019-03-24 12-14-37');
		await t('basic/VID_20190324_121446.mp4', 'basic/2019-03-24 12-14-46 basic [VID_20190324_121446].mp4', '2019-03-24 12-14-46');
		await t('basic/2018-01-02 03-04-05 my comment [my original name].jpg',
			'basic/2017-01-02 03-04-09 basic [my original name].jpg', '2017-01-02 03-04-09');

		// No timestamp
		await assert.untouched(ctx, '2019 test/1.jpg');

	});
});
