
import { describeAndSetup, itRun } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['--help'], async (foRun) => {
        foRun.assertSuccess();

        await foRun.assertConsistency();
    });
});
