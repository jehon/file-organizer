
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const shellExec = require('shell-exec');

const datas = require('./data.js');

const rootPath = (...args) => path.join((path.dirname(path.dirname(__dirname))), ...args);

// Test
function dataPath(...args) { return rootPath('test', 'data', 'system_test', ...args); }
function tempPath(...args) { return rootPath('tmp', ...args); }
exports.dataPath = dataPath;
exports.tempPath = tempPath;

async function describeAndSetup(testName, fn) {
	const tPath = (...args) => tempPath(testName, ...args);

	describe(testName, () => {
		beforeEach(async () => {
			jasmine.DEFAULT_TIMEOUT_INTERVAL = 20 * 1000;
			await fs.promises.rmdir(tPath(), { recursive: true });
			await fs.promises.mkdir(tPath(), { recursive: true });
			await fsExtra.copy(dataPath(), tPath());
		});

		return fn({
			testName,
			tempPath: tPath,
			listAll: async () => shellExec(`find ${tPath()} -type f`).then(res => console.info('Listing: \n', res.stdout))
		});
	});
}
exports.describeAndSetup = describeAndSetup;

// TODO(cleanup): use async-promise (see file-utils) to be uniform all around
async function runMain(ctx, ...args) {
	// console.log('+', ...args);
	const cmdLine = rootPath('/file-organizer/main.js') + ' "' + args.join('" "') + '"';
	// { stdout: '', stderr: '', cmd: '', code: x }
	const  result = await shellExec(cmdLine, {
		cwd: ctx.tempPath()
	// }).then((res) => { console.log('-'); return res;
	});

	result.cwd = ctx.tempPath();

	result.assertSuccess = function() {
		expect(this.code).toBe(0);
		expect(this.stderr).toBe('');
	};

	result.dump = function() {
		process.stdout.write('******' + args.join(' ') + '\n');
		process.stdout.write(result.stdout + '\n');
		process.stdout.write('------' + '\n');
		process.stdout.write(result.stderr + '\n');
		process.stdout.write('******' + '\n');
	};

	return result;
}

async function itRun(ctx, args, fn) {
	it('should run with ' + args.join(' '), async () => {
		const result = await runMain(ctx, ...args);

		fsExtra.writeFile(tempPath(ctx.testName + '-output.cmd'), result.cmd);
		fsExtra.writeFile(tempPath(ctx.testName + '-output.log'), result.stdout);
		fsExtra.writeFile(tempPath(ctx.testName + '-output.err'), result.stderr);

		result.assertContain = function(str)  {
			expect(this.stdout).toContain(str);
		};

		result.assertConsistency = async function(dir = '') {
			const l = async function(p, n) {
				return fs.promises.readdir(ctx.tempPath(p))
					.then(list => expect(list.length)
						.withContext(`(in folder '${p}' [${ctx.tempPath(dir)}])`)
						.toBe(n)
					);
			};

			l('basic', 4);
			l('2019 test', 2);
			return true;
		};

		await fn(result);
	});
}
exports.itRun = itRun;

async function getFileExifField(ctx, field, f) {
	const res = await runMain(ctx, 'info', '-k', field, f);
	res.assertSuccess();
	return res.stdout.trim();
}


exports.assert = {
	untouched: function(ctx, f) {
		return exports.assert.fileExists(ctx, f)
			.withTS()
			.withComment()
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
					.then(() => obj.withComment())
					.then(() => obj.done());
				return obj;
			},
			withTS: (data = false) => {
				promise = promise
					.then(() => exports.assert.fileHasExifTimestamp(ctx, f, data, foriginal));
				return obj;
			},
			withComment: (data = false) => {
				promise = promise
					.then(() => exports.assert.fileHasExifcomment(ctx, f, data, foriginal));
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

	fileHasExifcomment: async function (ctx, f, data = false, foriginal = false) {
		if (data === false) {
			data = datas[foriginal ? foriginal : f].title;
		}
		const res = await getFileExifField(ctx, 'exif_title', f);
		expect(res)
			.withContext(`File ${f} must have exif comment ${data} but have ${res}`)
			.toEqual(data);
	}
};
