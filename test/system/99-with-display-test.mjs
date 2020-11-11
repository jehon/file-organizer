
import { describeAndSetup, itRun } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['dump'], async (result) => {
        process.stdout.write(result.stdout);
    });
});
