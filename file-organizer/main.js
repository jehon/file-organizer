#!/usr/bin/env node

const yargs = require('yargs');

const options = require('./options.js');
const FileFactory = require('./file-factory.js');

Object.assign(options, yargs
	.options({
		'dryRun': {
			alias: [ 'dry-run', 'n'],
			type: 'boolean',
			default: false,
			coerce: (val) => {
				if (val) {
					console.info('Using dry run mode');
				}
				return val;
			}
		},
		'interactive': {
			type: 'boolean',
			default: true
		},
		'file': {
			type: 'string',
			default: '.',
			coerce: val => FileFactory(val)
		}
	})
	.commandDir('commands')
	.recommendCommands()
	.strict()
	.help()
	.argv);
