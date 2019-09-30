#!/usr/bin/env node

const yargs = require('yargs');

const fileFactory = require('./file-factory.js');
const options = require('./options.js');

Object.assign(options, yargs
	.options({
		'dryRun': {
			alias: [ 'dry-run', 'n'],
			type: 'boolean',
			coerce: (val) => {
				if (val) {
					console.info('Using dry run mode');
				}
				return val;
			}
		},
		'interactive': {
			type: 'boolean',
		},
		'files': {
			alias: [ 'f' ],
			type: 'array',
			default: [ ],
		}
	})
	.commandDir('commands')
	.recommendCommands()
	.strict()
	.help()
	.middleware(async (argv) => {
		// Put a default value in files if the list is empty
		if (argv.files.length == 0) {
			argv.files.push('.');
		}
		return Promise.all(argv.files.map(
			f => fileFactory(f)))
			.then(nlist => argv.files = nlist)
			.then(() => argv);
	})
	.argv);
