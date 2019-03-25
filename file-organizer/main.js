#!/usr/bin/env nodejs

const yargs = require('yargs');

const options = require('./options.js');
const FileFactory = require('./file-factory.js');

Object.assign(options, yargs
	.options({
		'dryRun': {
			alias: [ 'dry-run', 'dryrun', 'n'],
			type: 'boolean',
			default: false
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
