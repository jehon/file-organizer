
const yargs = require('yargs');

const options = yargs
	.command('* [source]', 'regularize automatically', {
		'dryRun': {
			alias: [ 'dry-run', 'n'],
			type: 'boolean',
			default: false
		}
		// // Manual options only:
		// 'forceTimestampedCanonicalFilename': {
		// 	alias: 'force-timestamped-canonical-filename',
		// 	type: 'boolean',
		// 	describe: 'Manual: reset the filename'
		// },
		// // Manual options only:
		// 'forcePictureOverrideComment': {
		// 	alias: 'force-picture-override-comment',
		// 	type: 'boolean',
		// 	describe: 'Manual: override the comment from the tag'
		// },
	})
	.help()
	.recommendCommands()
	.strict()
	// .wrap(Math.min(120, yargs.terminalWidth()))
	.argv;

if (!('source' in options)) {
	options.source = '.';
}

module.exports = options;
