
const messages = require('../messages.js');
const options = require('../options.js');
const FileFolder = require('../file-folder.js');

exports.command = [ '$0 [files..]', 'regularize [files..]' ];

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
	if (options.files.length == 0) {
		options.files = [ new FileFolder('.') ];
	}

	if (options.fixComment) {
		options.guessComment = true;
	}

	return Promise.all(options.files.map(f0 =>
		f0.iterate(
			f => messages.concurrencyLimit(() => f.loadData())
				.then(f => f.check())
		)))
		.then(() => {
			console.info('\n\nDone');
		});
};
