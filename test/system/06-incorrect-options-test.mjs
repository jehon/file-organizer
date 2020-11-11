
import { describeAndSetup, itRun } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['--blablabla'], async (foRun) => {
        expect(foRun.code).not.toBe(0);

        await foRun.assertConsistency();
    });
});
