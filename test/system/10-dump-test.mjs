
import { describeAndSetup, itRun } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['dump'], async (foRun) => {
        foRun.assertSuccess();

        await foRun.assertConsistency();
    });
});
