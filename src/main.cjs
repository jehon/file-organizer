#!/usr/bin/env node


// Electron require a cjs at first
// Let's go to esm

const yargs = require('yargs');

const fileFactory = require('../file-organizer/file-factory.js');
const options = require('../file-organizer/options.js');
const messages = require('../file-organizer/messages.js');

// TODO: Fix problem in version < 4.1 coming from jsonfile 4.0.0 in fs-extra 8.1.0
require('graceful-fs');

const fs = require('fs');
const path = require('path');
// const { rootDir } = require('./common/constants.js');

fs.promises.readdir(path.join(__dirname, 'main', 'commands'))
    .then(list => list.filter(v => v.endsWith('.js')))
    .then((list) => Promise.all(
        list.map(f => import(path.join(__dirname, 'main', 'commands', f)))
    ))
    .then(cmd => {
        const yparser = yargs
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
                'debug': {
                    alias: ['d'],
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
            // .commandDir('./main/commands')
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
            .onFinishCommand(() => {
                if (options.headless) {
                    process.exit(0);
                }
            });

        for (const c of cmd) {
            yparser.command(c.command,
                c.describe,
                c.builder ?? (() => { }),
                c.handler);
        }

        Object.assign(options, yparser.argv);
    });
