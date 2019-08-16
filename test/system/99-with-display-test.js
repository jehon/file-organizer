
const path = require('path');

const { describeAndSetup, itRun } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'dump' ], async (result) => {
		process.stdout.write(result.stdout);
	});
});
