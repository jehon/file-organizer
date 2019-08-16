
const path = require('path');

const { describeAndSetup, itRun } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ 'regularize', '-n' ], async (result) => {
		result.assertSuccess();

		await result.assertConsistency();
	});
});
