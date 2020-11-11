
import { describeAndSetup, itRun } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['dump'], async (result) => {
        result.assertSuccess();

        await result.assertConsistency();
    });
});
