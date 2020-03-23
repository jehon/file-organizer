#!/usr/bin/env node

const yargs = require('yargs');

const fileFactory = require('./file-factory.js');
const options = require('./options.js');
const messages = require('./messages.js');

// TODO: Fix problem in version < 4.1 coming from jsonfile 4.0.0 in fs-extra 8.1.0
require('graceful-fs');

Object.assign(options, yargs
    .options({
        'dryRun': {
            alias: ['dry-run', 'n'],
            type: 'boolean',
            coerce: (val) => {
                if (val) {
                    console.info('Using dry run mode');
                }
                return val;
            }
        },
        'headless': {
            type: 'boolean',
            default: false
        },
        'files': {
            alias: ['f'],
            type: 'array',
            default: [],
        },
        'setTitle': {
            alias: ['set-title', 'c'],
            type: 'string',
            default: ''
        },
        'forceTitleFromFilename': {
            alias: ['force-title-from-filename', 'ftfn'],
            type: 'boolean',
            default: false
        },
        'forceTitleFromFolder': {
            alias: ['force-title-from-folder', 'ftff'],
            type: 'boolean',
            default: false
        },
        'forceTimestampFromFilename': {
            alias: ['force-timestamp-from-filename', 'ftsfn'],
            type: 'boolean',
            default: false
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
        messages.statsAddFileToTotal(argv.files.length);
        return Promise.all(argv.files.map(
            f => fileFactory('' + f)))
            .then(nlist => argv.files = nlist)
            .then(() => argv);
    })
    .argv);
