
import { describeAndSetup, itRun } from './run-helper.js';

describeAndSetup(import.meta.url, (ctx) => {
    itRun(ctx, ['--blablabla'], async (result) => {
        expect(result.code).not.toBe(0);

        await result.assertConsistency();
    });
});
