
const options = require('../options.js');

exports.command = [ '$0 [files..]', 'regularize [files..]' ];

exports.describe = 'Regularize the files';

exports.builder = {
	'setComment': {
		alias: [ 'set-comment', 'c' ],
		type: 'string',
		default: ''
	},
	'forceCommentFromFilename': {
		alias: [ 'force-comment-from-filename', 'fcfn' ],
		type: 'boolean',
		default: false
	},
	'forceCommentFromFolder': {
		alias: [ 'force-comment-from-folder', 'fcff' ],
		type: 'boolean',
		default: false
	},
	'forceTimestampFromFilename': {
		alias: [ 'force-timestamp-from-filename', 'ftsfn' ],
		type: 'boolean',
		default: false
	}
};

exports.handler = function (noptions) {
	Object.assign(options, noptions);

	return Promise.all(options.files.map(
		fi => fi.iterate(
			f => f.loadData()
				.then(f => f.check())
		))
	)
		.then(() => {
			console.info('\n\nDone');
		});
};
