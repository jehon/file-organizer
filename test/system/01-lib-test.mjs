
import FileTimed from '../../src/main/file-types/file-timed.js';
import { describeAndSetup, itRun, assert, getFileExifField } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    it('get exif infos', async () => {
        const exif = await getFileExifField(ctx, FileTimed.I_FT_TIME, 'basic/DSC_2506.MOV');
        expect(exif).toBe('2019-09-19 07-48-25');
    });

    itRun(ctx, ['dump'], async (foRun) => {
        foRun.assertSuccess();

        // This would test concistency: :-)
        // import fs from 'fs';
        // fs.unlinkSync(ctx.tempPath('2019 test/1.jpg'));

        await foRun.assertConsistency();

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
