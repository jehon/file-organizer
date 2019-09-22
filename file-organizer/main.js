#!/usr/bin/env node

const yargs = require('yargs');

const options = require('./options.js');
const FileFactory = require('./file-factory.js');
const FileFolder = require('./file-folder.js');

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
			coerce: (val) => val.map(f => FileFactory(f))
		}
	})
	.commandDir('commands')
	.recommendCommands()
	.strict()
	.help()
	.middleware((argv) => {
		// Put a default value in files if the list is empty
		if (argv.files.length == 0) {
			argv.files.push(new FileFolder('.'));
		}
		return argv;
	})
	.argv);
