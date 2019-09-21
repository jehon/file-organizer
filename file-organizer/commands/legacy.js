
const options = require('../options.js');

exports.command = 'legacy';

exports.describe = 'Get some info about the files';

exports.builder = {
	'fix': {
		alias: [ 'f' ],
		type: 'boolean'
	}
};

// TODO: treat unknown file type ???

exports.handler = function (noptions) {
	Object.assign(options, noptions, {
		guessComment: true
	});

	return Promise.all(options.files.map(f0 =>
		f0.iterate(f => {
			if (f.getType() == 'movie') {
				return f.loadData()
					.then(f => f.check());
			}
			return Promise.resolve(true);
		})))
		.then(() => {
			console.info('\n\nDone');
		});
};
