
const options = require('../options.js');
const FileUnsupported = require('../file-unsupported.js');
const messages = require('../messages.js');

exports.command = 'unsupported';

exports.describe = 'Get some info about the files';

exports.handler = function (noptions) {
	Object.assign(options, noptions, {
		showHidden: true
	});

	return Promise.all(options.files.map(
		f0 => f0.iterate(
			f => {
				if (f instanceof FileUnsupported) {
					messages.writeLine('Unsupported: ', f.getRelativePath());
				}
			})
	))
		.then(() => {
			console.info('\n\n');
			FileUnsupported.dumpDiscoveredExtension();
		});
};
