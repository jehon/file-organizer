
const options = require('../options.js');

exports.command = 'legacy';

exports.describe = 'Get some info about the files';

exports.builder = {
	'fix': {
		alias: [ 'f' ],
		type: 'boolean'
	}
};

exports.handler = function (noptions) {
	Object.assign(options, noptions);

	return Promise.all(options.files.map(f0 =>
		f0.iterate(f => {
			const tsType = f.getInfo('timestamp.type');
			if (tsType == 'version0') {
				console.info(f.getRelativePath(), ' -> ', f.getCanonicalFilename(), options.fix ? ' V ' : ' ? ');
			}
		})))
		.then(() => {
			console.info('\n\nDone');
		});
};
