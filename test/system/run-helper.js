
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import shellExec from 'shell-exec';
import { execFile } from 'child_process';
import { promisify } from 'util';

import { t } from '../test-helper.js';

import datas from './data.js';
import FileTimestamped from '../../src/main/file-types/file-timestamped.js';

const rootPath = (...args) => path.join((path.dirname(path.dirname(path.dirname(new URL(import.meta.url).pathname)))), ...args);

/**
 * @typedef Context
 * @property {string} testName of the test
 * @property {function(...string):string} tempPath calculate the temp path of an object
 * @property {function():Promise<Array<string>>} listAll list all files
 */

// Test
/**
 * Calculate the relative path to a file in data folder (test/data/system_Test)
 *
 * @param {...string} args - the sub parts of the file
 * @returns {string} the path
 */
export function dataPath(...args) { return rootPath('test', 'data', 'system_test', ...args); }

/**
 * Calculate the relative path to a file from the root folder
 *
 * @param {...string} args - the sub parts of the file
 * @returns {string} the path
 */
export function tempPath(...args) { return rootPath('tmp', ...args); }

/**
 * Setup the describe with the filename as the test name
 * And setup the tmp folder where the test can run
 *
 * @param {string} url - import.meta.url
 * @param {function(*): void} fn - the describe function
 */
export async function describeAndSetup(url, fn) {
    const testName = t(url);

    const tPath = (...args) => tempPath(testName, ...args);

    describe(testName, () => {
        beforeEach(async () => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 20 * 1000;
            await fs.promises.rmdir(tPath(), { recursive: true });
            await fs.promises.mkdir(tPath(), { recursive: true });
            await fsExtra.copy(dataPath(), tPath());
        });

        /**
         * @type {Context} of the test
         */
        return fn({
            testName,
            tempPath: tPath,
            // TODO: remove shellExec in favor of builtin child_process.fileExec
            listAll: async () => shellExec(`find ${tPath()} -type f`).then(res => console.info('Listing: \n', res.stdout))
        });
    });
}

/**
 * @param {Context} ctx of the test
 * @param {Array<string>} args to be passed to the run
 * @param {function(FORun):void} fn of the "it"
 */
export async function itRun(ctx, args, fn) {
    it('should run with ' + args.join(' '), async () => {
        const foRun = new FORun(ctx);
        await foRun.run(...args);
        await fn(foRun);
    });
}

export class FORun {
    /**
     * @param {Context} ctx of the test
     */
    constructor(ctx) {
        this.ctx = { ...ctx };
        this.cwd = ctx.tempPath();
    }

    /**
     * @param  {...any} args      * @param {...any} args to be passed to the executable
     */
    async run(...args) {
        this.args = args;

        this.cmdLine = rootPath('/file-organizer.sh') + ' --headless "' + this.args.join('" "') + '"';
        // { stdout: '', stderr: '', cmd: '', code: x }
        // TODO: remove shellExec in favor of builtin child_process.fileExec
        this.result = await shellExec(this.cmdLine, { cwd: this.cwd });

        await Promise.all([
            fsExtra.writeFile(tempPath(this.ctx.testName + '-output.cmd'), this.result.cmd),
            fsExtra.writeFile(tempPath(this.ctx.testName + '-output.log'), this.result.stdout),
            fsExtra.writeFile(tempPath(this.ctx.testName + '-output.err'), this.result.stderr),
        ]);
    }

    assertSuccess() {
        if (this.result.code > 0 || this.result.stderr.length > 0) {
            process.stdout.write(this.result.stdout);
            process.stdout.write(this.result.stderr);
        }
        expect(this.result.code)
            .withContext(this.result.stdout + '\n####\n' + this.result.stderr)
            .toBe(0);
        expect(this.result.stderr)
            .withContext(this.result.stdout + '\n####\n' + this.result.stderr)
            .toBe('');
    }

    dump() {
        process.stdout.write('******' + this.cmdLine + '\n');
        process.stdout.write(this.result.stdout + '\n');
        process.stdout.write('------' + '\n');
        process.stdout.write(this.result.stderr + '\n');
        process.stdout.write('******' + '\n');
    }

    assertContain(str) {
        expect(this.result.stdout).toContain(str);
    }

    async assertConsistency(dir = '') {
        const l = async (p, n) => {
            return fs.promises.readdir(this.ctx.tempPath(p))
                .then(list => expect(list.length)
                    .withContext(`(in folder '${p}' [${this.ctx.tempPath(dir)}])`)
                    .toBe(n)
                );
        };

        l('basic', 4);
        l('2019 test', 2);
        return;
    }
}

/**
 * @param {Context} ctx of the test
 * @param {string} field to be extracted
 * @param {string} f - pathname of the file
 * @returns {Promise<string>} with the exiv field
 */
export async function getFileExifField(ctx, field, f) {
    // https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
    const result = await promisify(execFile)(
        rootPath('file-organizer-headless.sh'),
        ['info', '-k', field, ctx.tempPath(f)]
    )
        .catch(e => {
            throw `Could not read exiv data: ${e.stdout} -err- ${e.stderr}`;
        });

    return result.stdout.trim();
}

export const assert = {
    untouched: function (ctx, f) {
        return assert.fileExists(ctx, f)
            .withTS()
            .withTitle()
            .done();
    },
    fileExists: function (ctx, f) {
        const fpath = ctx.tempPath(f);

        /** @type {Promise<void>} */
        let promise = fsExtra.pathExists(fpath)
            .then((res) => { expect(res).withContext(`File '${f}' must exists but does not`).toBeTruthy(); });

        let foriginal = f;

        const obj = {
            from: (forig) => {
                foriginal = forig;
                return obj;
            },
            untouched: () => {
                promise = promise
                    .then(() => obj.withTS())
                    .then(() => obj.withTitle())
                    .then(() => obj.done());
                return obj;
            },
            withTS: (data = null) => {
                promise = promise
                    .then(() => assert.fileHasExifTimestamp(ctx, f, data, foriginal));
                return obj;
            },
            withTitle: (data = null) => {
                promise = promise
                    .then(() => assert.fileHasExifTitle(ctx, f, data, foriginal));
                return obj;
            },
            done: () => promise
        };

        return obj;
    },

    fileDoesNotExists: async function (ctx, f) {
        const exists = await fsExtra.pathExists(path.join(ctx.tempPath(), f));
        expect(exists).toBeFalsy(`File ${f} must NOT exists but does`);
    },


    fileHasExifTimestamp: async function (ctx, f, data = null, foriginal = null) {
        if (data === null) {
            data = datas[foriginal ? foriginal : f].ts;
        }
        const res = await getFileExifField(ctx, FileTimestamped.I_ITS_TIME, f);
        expect(res)
            .withContext(`File ${f} exif timestamp`)
            .toEqual(data);
    },

    fileHasExifTitle: async function (ctx, f, data = null, foriginal = null) {
        if (data === null) {
            data = datas[foriginal ? foriginal : f].title;
        }
        const res = await getFileExifField(ctx, FileTimestamped.I_ITS_TITLE, f);
        expect(res)
            .withContext(`File ${f} exif title`)
            .toEqual(data);
    }
};
