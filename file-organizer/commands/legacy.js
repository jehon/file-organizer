
const options = require('../options.js');
const FileUnsupported = require('../file-unsupported.js');

exports.command = 'legacy';

exports.describe = 'Get some info about the files';

exports.handler = function (noptions) {
	Object.assign(options, noptions, {
		dryRun: true
	});

	return Promise.all(options.files.map(
		f0 => f0.iterate(
			f => {
				if (f.getType() == 'movie') {
					return f.loadData()
						.then(f => f.check());
				}
				return Promise.resolve(true);
			})
	))
		.then(() => {
			console.info('\n\nDone');
			FileUnsupported.dumpDiscoveredExtension();
		});
};
