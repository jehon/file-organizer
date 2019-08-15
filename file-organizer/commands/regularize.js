
const options = require('../options.js');

exports.command = [ '$0 [file]', 'regularize [file]' ];

exports.describe = 'Regularize the files';

exports.builder = {
	'setComment': {
		alias: [ 'set-comment', 'sc' ],
		type: 'string',
		default: ''
	},
	'guessComment': {
		alias: [ 'guess-comment', 'gc' ],
		type: 'boolean',
		default: false
	},
	'fixComment': {
		alias: [ 'fix-comment', 'fc' ],
		type: 'boolean',
		default: false
	},
	'fixCommentFromFolder': {
		alias: [ 'fix-comment-from-folder', 'fcff' ],
		type: 'boolean',
		default: false
	},

	'setTimestampFromFile': {
		alias: [ 'set-timestamp', 'sts' ],
		type: 'boolean',
		default: false
	}
};

exports.handler = function (noptions) {
	Object.assign(options, noptions);

	if (options.fixComment) {
		options.guessComment = true;
	}

	Promise.all(options.files.map(f => f.iterate(f => f.check())))
		.then(() => {
			console.info('\n\nDone');
		});
};
