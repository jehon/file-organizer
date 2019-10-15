
const options = require('../options.js');
const FileUnsupported = require('../file-unsupported.js');

exports.command = 'legacy';

exports.describe = 'Get some info about the files';

exports.handler = function (noptions) {
	Object.assign(options, noptions, {
	});

	return Promise.all(options.files.map(
		fi => fi.iterate(
			f => {
				if (f.type == 'movie') {
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
