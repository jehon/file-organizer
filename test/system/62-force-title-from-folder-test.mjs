
import path from 'path';

import { describeAndSetup, itRun, assert } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['regularize', '--force-title-from-folder'], async (foRun) => {
        foRun.assertSuccess();

        await foRun.assertConsistency();

        /**
         * @param {string} fold - relative filepath to be checked
         * @param {string} fnew - new filepath after run
         * @param {string} title to be found in exiv
         * @returns {Promise} resolve when test is passed
         */
        function t(fold, fnew, title) {
            if (!fnew) {
                fnew = fold;
            }
            title = title ? title : path.basename(path.dirname(fnew));
            return assert.fileExists(ctx, fnew).from(fold).withTS()
                .withTitle(title)
                .done();
        }

        await t('basic/DSC_2506.MOV', 'basic/2019-09-19 07-48-25 basic [DSC_2506].mov');
        await t('basic/IMG_20190324_121437.jpg', 'basic/2019-03-24 12-14-38 basic [IMG_20190324_121437].jpg');
        await t('basic/VID_20190324_121446.mp4', 'basic/2019-03-24 12-14-46 basic [VID_20190324_121446].mp4');
        await t('basic/2018-01-02 03-04-05 my title [my original name].jpg',
            'basic/2018-01-02 03-04-05 basic [my original name].jpg');

        await assert.untouched(ctx, '2019 test/1.jpeg'); // Faulty: no timestamp
        await t('2019 test/DSC_2506.MOV', '2019 test/2019-09-19 07-48-25 test [DSC_2506].mov', 'test');
    });
});
