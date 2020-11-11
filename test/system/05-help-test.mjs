
import { describeAndSetup, itRun } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['--help'], async (result) => {
        result.assertSuccess();

        await result.assertConsistency();
    });
});
