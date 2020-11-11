
import fs from 'fs';

import { describeAndSetup, itRun, assert } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    beforeEach(async () => {
        fs.renameSync(ctx.tempPath('basic/2018-01-02 03-04-05 my title [my original name].jpg'),
            ctx.tempPath('basic/2019-03-24 12-14-38 basic [IMG_20190324_121437].jpg'));
        // await ctx.listAll();
    });

    itRun(ctx, ['regularize', '--force-title-from-folder', '--force-timestamp-from-filename'], async (foRun) => {
        pending('Indexed is not available');

        foRun.assertSuccess();
        // result.dump();
        // await ctx.listAll();

        await foRun.assertConsistency();

        // Blocking file
        await assert.fileExists(ctx, 'basic/2019-03-24 12-14-37 basic [IMG_20190324_121437].jpg');

        // Blocked file
        await assert.fileExists(ctx, 'basic/2019-03-24 12-14-37 basic [1].jpg');

    });
});

