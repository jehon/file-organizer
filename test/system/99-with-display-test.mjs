
import { describeAndSetup, itRun } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['dump'], async (foRun) => {
        process.stdout.write(foRun.result.stdout);
    });
});
