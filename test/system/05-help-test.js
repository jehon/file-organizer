
const path = require('path');

const { describeAndSetup, itRun } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
    itRun(ctx, [ '--help' ], async (result) => {
        result.assertSuccess();

        await result.assertConsistency();
    });
});
