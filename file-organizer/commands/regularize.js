
exports.command = [ '$0 [file]', 'regularize [file]' ];

exports.describe = 'Regularize the files';

exports.builder = {
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
	}
};

exports.handler = function (options) {
	if(options.fixComment) {
		options.guessComment = true;
	}


	options.file.iterate(async function(f) {
		await f.check();
	}).then(() => {
		console.info('\n\nDone');
	});
};
