#!/usr/bin/env node


// Electron require a cjs at first
// Let's go to esm

import yargs from 'yargs';

import options from '../../file-organizer/options.js';
import messages from '../../file-organizer/messages.js';

// TODO: Fix problem in version < 4.1 coming from jsonfile 4.0.0 in fs-extra 8.1.0
import 'graceful-fs';

import importDirectory from './importDirectory.js';
import loadFileTypes from './loadFileTypes.js';
import { buildFile } from './register-file-types.js';

Promise.resolve()
    .then(() => loadFileTypes())
    .then(() =>
        importDirectory('src/main/commands')
            .then(cmds => {
                let yparser = yargs(process.argv.slice(2))
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
                        argv.files = argv.files.map(f => buildFile('' + f));
                        return argv;
                    })
                    .onFinishCommand(() => {
                        if (options.headless) {
                            process.exit(0);
                        }
                    });

                for (const c of cmds) {
                    yparser = yparser.command(c.command,
                        c.describe,
                        c.builder ?? {},
                        c.handler ?? '');
                }

                Object.assign(options, yparser.argv);
            })
    )
    .catch(e => console.error(e));
