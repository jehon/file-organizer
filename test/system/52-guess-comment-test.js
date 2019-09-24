
const path = require('path');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'regularize', '--guess-comment' ], async (result) => {
		result.assertSuccess();
		await result.assertConsistency();

		function t(fold, fnew)  {
			if (!fnew) {
				fnew = fold;
			}
			return assert.fileExists(ctx, fnew).from(fold).untouched();
		}

		await t('basic/DSC_2506.MOV',            'basic/2019-09-19 07-48-25 basic [DSC_2506].mov');
		await t('basic/IMG_20190324_121437.jpg', 'basic/2019-03-24 12-14-38 basic [IMG_20190324_121437].jpg');
		await t('basic/VID_20190324_121446.mp4', 'basic/2019-03-24 12-14-46 basic [VID_20190324_121446].mp4');
		await t('basic/2018-01-02 03-04-05 my comment [my original name].jpg');

		// No timestamp
		await t('2019 test/1.jpeg');
	});
});
