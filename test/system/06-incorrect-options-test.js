
const path = require('path');

const { describeAndSetup, itRun } = require('./run-helper.js');

describeAndSetup(path.basename(__filename), (ctx) => {
	itRun(ctx, [ '--blablabla' ], async (result) => {
		expect(result.code).not.toBe(0);

		await result.assertConsistency();
	});
});
