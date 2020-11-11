
import fs from 'fs';

import { describeAndSetup, itRun, assert } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    beforeEach(() => {
        fs.renameSync(ctx.tempPath('basic/DSC_2506.MOV'),
            ctx.tempPath('basic/2017-01-02 01-02-03 [DSC_2506].mov'));
        fs.renameSync(ctx.tempPath('basic/2018-01-02 03-04-05 my title [my original name].jpg'),
            ctx.tempPath('basic/2017-01-02 03-04-09 my title [my original name].jpg'));
        //TODO (mp4-ts): mp4 set timestamp
        // fs.renameSync(ctx.tempPath('basic/VID_20190324_121446.mp4'),
        // 	ctx.tempPath('basic/VID_20170324_121446.mp4'));

    });

    itRun(ctx, ['regularize', '--force-timestamp-from-filename'], async (foRun) => {
        foRun.assertSuccess();

        await foRun.assertConsistency();

        /**
         * @param {string} fold - relative filepath to be checked
         * @param {string} fnew - new filepath after run
         * @param {string} ts - the timestamp
         * @returns {Promise} resolve when test is passed
         */
        async function t(fold, fnew, ts) {
            return assert.fileExists(ctx, fnew ? fnew : fold)
                .from(fold)
                .withTS(ts)
                .withTitle('basic')
                .done();
        }

        await t('basic/DSC_2506.MOV', 'basic/2017-01-02 01-02-03 basic [DSC_2506].mov', '2017-01-02 01-02-03');
        await t('basic/IMG_20190324_121437.jpg', 'basic/2019-03-24 12-14-37 basic [IMG_20190324_121437].jpg', '2019-03-24 12-14-37');
        await t('basic/VID_20190324_121446.mp4', 'basic/2019-03-24 12-14-46 basic [VID_20190324_121446].mp4', '2019-03-24 12-14-46');
        await assert.fileExists(ctx, 'basic/2017-01-02 03-04-09 my comment [my original name].jpg')
            .from('basic/2018-01-02 03-04-05 my title [my original name].jpg')
            .withTS('2017-01-02 03-04-09')
            .withTitle('my comment')
            .done();

        await assert.untouched(ctx, '2019 test/1.jpeg'); // Faulty: no timestamp in exif or filename
        await assert.untouched(ctx, '2019 test/DSC_2506.MOV'); // Faulty: no title in exif or filename

    });
});
