
const path = require('path');

const { describeAndSetup, itRun, assert } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'regularize', '-n' ], async (result) => {
		result.assertSuccess();

		await result.assertConsistency();
		async function t(f)  {
			return assert.untouched(ctx, f);
		}

		await t('basic/DSC_2506.MOV');
		await t('basic/IMG_20190324_121437.jpg');
		await t('basic/VID_20190324_121446.mp4');
		await t('basic/2018-01-02 03-04-05 my comment [my original name].jpg');

		await t('2019 test/1.jpeg');

		// await t('other test/1.jpeg');
		// await t('other test/2018-01-02 03-04-05 my incoherent comment [my original name].jpg');
		// await t('other test/2.jpeg');
		// await t('2019 test/2.jpeg');
		// await t('2019 test/IMG_20190324_121437.jpg');
		// await t('2019 test/3.jpeg');
		// await t('2019 test/VID_20190324_121446.mp4');

	});
});
