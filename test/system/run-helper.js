
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import shellExec from 'shell-exec';

import datas from './data.js';

const rootPath = (...args) => path.join((path.dirname(path.dirname(path.dirname(new URL(import.meta.url).pathname)))), ...args);

/**
 * @typedef Context
 * @property {string} testName of the test
 * @property {function(...string):string} tempPath calculate the temp path of an object
 * @property {function():Promise<Array<string>>} listAll list all files
 */

/**
 * @typedef RunResult
 * @property {string} cwd of the run
 * @property {string} cmd of the command
 * @property {string} stdout of the run
 * @property {string} stderr of the run
 * @property {function():void} assertSuccess expect result code to be 0
 * @property {function():void} dump the stdout
 * @property {function(string):void} assertContain that stdout contain text
 * @property {function():Promise<void>} assertConsistency - that the same number of files are presents
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
    const testName = new URL(url).pathname.split('/').pop();

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
            listAll: async () => shellExec(`find ${tPath()} -type f`).then(res => console.info('Listing: \n', res.stdout))
        });
    });
}

// TODO(cleanup): use async-promise (see file-utils) to be uniform all around
/**
 * @param {Context} ctx of the test
 * @param {...any} args to be passed to the executable
 * @returns {Promise<RunResult>} of the test
 */
async function runMain(ctx, ...args) {
    // console.log('+', ...args);
    const cmdLine = rootPath('/file-organizer.sh') + ' --headless "' + args.join('" "') + '"';
    // { stdout: '', stderr: '', cmd: '', code: x }
    const result = await shellExec(cmdLine, {
        cwd: ctx.tempPath()
        // }).then((res) => { console.log('-'); return res;
    });

    result.cwd = ctx.tempPath();

    result.assertSuccess = function () {
        if (this.code > 0 || this.stderr.length > 0) {
            process.stdout.write(this.stdout);
            process.stdout.write(this.stderr);
        }
        expect(this.code)
            .withContext(this.stdout + '\n####\n' + this.stderr)
            .toBe(0);
        expect(this.stderr)
            .withContext(this.stdout + '\n####\n' + this.stderr)
            .toBe('');
    };

    result.dump = function () {
        process.stdout.write('******' + args.join(' ') + '\n');
        process.stdout.write(result.stdout + '\n');
        process.stdout.write('------' + '\n');
        process.stdout.write(result.stderr + '\n');
        process.stdout.write('******' + '\n');
    };

    return result;
}

/**
 * @param {Context} ctx of the test
 * @param {Array<string>} args to be passed to the run
 * @param {function(RunResult):void} fn of the "it"
 */
export async function itRun(ctx, args, fn) {
    it('should run with ' + args.join(' '), async () => {
        const result = await runMain(ctx, ...args);

        fsExtra.writeFile(tempPath(ctx.testName + '-output.cmd'), result.cmd);
        fsExtra.writeFile(tempPath(ctx.testName + '-output.log'), result.stdout);
        fsExtra.writeFile(tempPath(ctx.testName + '-output.err'), result.stderr);

        result.assertContain = function (str) {
            expect(this.stdout).toContain(str);
        };

        result.assertConsistency = async function (dir = '') {
            const l = async function (p, n) {
                return fs.promises.readdir(ctx.tempPath(p))
                    .then(list => expect(list.length)
                        .withContext(`(in folder '${p}' [${ctx.tempPath(dir)}])`)
                        .toBe(n)
                    );
            };

            l('basic', 4);
            l('2019 test', 2);
            return;
        };

        await fn(result);
    });
}

/**
 * @param {Context} ctx of the test
 * @param {string} field to be extracted
 * @param {string} f - pathname of the file
 * @returns {Promise<string>} with the exiv field
 */
async function getFileExifField(ctx, field, f) {
    const res = await runMain(ctx, 'info', '-k', field, f);
    res.assertSuccess();
    return res.stdout.trim();
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

        let promise = fsExtra.pathExists(fpath)
            .then((res) => expect(res).withContext(`File '${f}' must exists but does not`).toBeTruthy());

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
            withTS: (data = false) => {
                promise = promise
                    .then(() => assert.fileHasExifTimestamp(ctx, f, data, foriginal));
                return obj;
            },
            withTitle: (data = false) => {
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


    fileHasExifTimestamp: async function (ctx, f, data = false, foriginal = false) {
        if (data === false) {
            data = datas[foriginal ? foriginal : f].ts;
        }
        const res = await getFileExifField(ctx, 'exif_timestamp', f);
        expect(res)
            .withContext(`File ${f} must have exif timestamp ${data} but have ${res}`)
            .toEqual(data);
    },

    fileHasExifTitle: async function (ctx, f, data = false, foriginal = false) {
        if (data === false) {
            data = datas[foriginal ? foriginal : f].title;
        }
        const res = await getFileExifField(ctx, 'exif_title', f);
        expect(res)
            .withContext(`File ${f} must have exif title ${data} but have ${res}`)
            .toEqual(data);
    }
};

