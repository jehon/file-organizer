#!/usr/bin/env node


// Electron require a cjs at first
// Let's go to esm

import yargs from 'yargs';

import options from '../common/options.js';

import importDirectory from './importDirectory.js';
import loadFileTypes from './loadFileTypes.js';
import { buildFile } from './register-file-types.js';
import { guiAvailable, guiStart } from '../gui.js';

(async () => {
    try {
        await loadFileTypes();

        let cmds = await importDirectory('src/main/commands');

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
                argv.files = argv.files.map(f => buildFile('' + f));
                argv.files.map(f => { f.isRoot = true; });

                return argv;
            })
            .onFinishCommand(() => {
                if (guiAvailable()) {
                    process.stdout.write('Parsing done\n');
                }
            });

        for (const c of cmds) {
            yparser = yparser.command(c.command,
                c.describe,
                c.builder ?? {},
                c.handler ?? '');
        }

        Object.assign(options, await yparser.argv);

        if (guiAvailable()) {
            await guiStart();
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
