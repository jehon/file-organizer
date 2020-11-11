

import { describeAndSetup, itRun, assert } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['dump'], async (result) => {
        result.assertSuccess();

        // This would test concistency: :-)
        // import fs from 'fs';
        // fs.unlinkSync(ctx.tempPath('2019 test/1.jpg'));

        await result.assertConsistency();

        await assert.untouched(ctx, 'basic/DSC_2506.MOV');

        await assert.fileExists(ctx, 'basic/DSC_2506.MOV')
            .withTS('2019-09-19 07-48-25')
            .withTitle('')
            .done();

        await assert.fileExists(ctx, 'basic/DSC_2506.MOV')
            .withTS()
            .withTitle()
            .done();
    });
});
