
exports.command = [ '$0 [file]', 'regularize [file]' ];

exports.describe = 'Regularize the files';

exports.builder = {
	'guessComment': {
		alias: [ 'guess-comment', 'gc' ],
		type: 'boolean',
		default: false
	}
};

exports.handler = function (options) {
	options.file.iterate(async function(f) {
		await f.check();
	}).then(() => {
		console.info('\n\nDone');
	});
};
