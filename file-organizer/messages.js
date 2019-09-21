
const ansiEscapes = require('ansi-escapes');
require('colors');
const chalk = require('chalk');
const pLimit = require('p-limit'); // https://www.npmjs.com/package/p-limit

const options = require('./options.js');
const BusinessError = require('./business-error.js');
// const { ellipseLeft } = require('./string-utils.js');

const IconSuccess = chalk.green('✓');
const IconFailure = chalk.red.bold('✘');
const IconSkipped = chalk.magenta('⚐');
const IconImpossible = chalk.red('⚑');

module.exports.IconSuccess    = IconSuccess;
module.exports.IconFailure    = IconFailure;
module.exports.IconSkipped    = IconSkipped;
module.exports.IconImpossible = IconImpossible;


const concurrencyLimit = pLimit(10);
module.exports.concurrencyLimit = concurrencyLimit;

const stats = {
	filesCount: 0,
	fixesCount: 0,
	errorsCount: 0,
	skippedCount: 0,
	impossibleCount: 0
};
module.exports.stats = stats;

const messagesPerFiles = {};
const folders = [];

function cleanLine() {
	if (options.interactive) {
		// Force being at the beginnning of the line
		process.stdout.write(ansiEscapes.eraseLine);
		process.stdout.write(ansiEscapes.cursorTo(0));
	}

}
module.exports.cleanLine = cleanLine;

function dumpStats() {
	if (options.interactive) {
		cleanLine();

		// Write infos on one line, erase it after
		process.stdout.write(
			(('* '
				// + (concurrencyLimit.pendingCount > 0 ? concurrencyLimit.pendingCount + ': ' : '')
				+ `Total files: ${stats.filesCount}`
				+ ((Object.keys(messagesPerFiles).length > 0) ? ` - pending: ${Object.keys(messagesPerFiles).length}` : '')
				+ (stats.fixesCount                      > 0 ? ` - fixes: ${stats.fixesCount}` : '')
				+ (stats.skippedCount                    > 0 ?` - skipped: ${stats.skippedCount}` : '')
				+ (stats.errorsCount                     > 0 ?` - errors: ${stats.errorsCount}` : '')
				+ (stats.impossibleCount                 > 0 ?` - impossible: ${stats.impossibleCount}` : '')
			)
			+ ' '
			+ folders.join(',')).substr(0, process.stdout.columns - 1).white.bgCyan
		);
	}
}

module.exports.fileStart = function(file) {
	const k = file.getRelativePath();
	if (!(k in messagesPerFiles)) {
		messagesPerFiles[k] = '';
		stats.filesCount++;
		const FileFoder = require('./file-folder.js');
		if (file instanceof FileFoder) {
			folders.push(file.getRelativePath());
		}
	}
	dumpStats();
};

module.exports.fileEnd = function(file) {
	const k = file.getRelativePath();
	if (messagesPerFiles[k]) {
		cleanLine();

		const header = (file.getFilename() + file.getExtension()) + ' in ' + chalk.gray(file.parent.getRelativePath());

		process.stdout.write(header
			+ '\n  ' + file._originalFilePath
			+ messagesPerFiles[k] + '\n\n');
	}
	delete messagesPerFiles[k];
	const i = folders.indexOf(file.getRelativePath());
	if (i >= 0) {
		folders.splice(i, 1);
	}
	dumpStats();
};


module.exports.fileInfo = function(file, code, description, newInfo = null) {
	module.exports.fileMsg(file, code, description, newInfo, IconSuccess);
	return true;
};

module.exports.fileCommit = async function(file, code, description, newInfo = null, action = null) {
	let res = false;
	let msg = IconSkipped;

	if (options.dryRun) {
		options.skippedCount++;
	} else {
		try {
			res = await action();

			if (res === undefined) {
				res = true;
			}
			if (res) {
				msg = IconSuccess;
				stats.fixesCount++;
			} else {
				msg = IconFailure;
				stats.errorsCount++;
			}
		} catch (e) {
			if (e instanceof BusinessError) {
				console.error('Business error: ', e.getMessage ? e.getMessage() : '');
				stats.impossibleCount++;
			} else {
				console.error('Error: ', e);
				stats.errorsCount++;
			}
		}
	}

	module.exports.fileMsg(file, code, description, newInfo, msg);
	return res;
};

module.exports.fileImpossible = function(file, code, description) {
	stats.impossibleCount++;
	module.exports.fileMsg(file, code, description, null, IconImpossible);
	return false;
};

/**
 * !! Await on this one: await file.message(...)
 *
 * @param description(string): free text
 *
 * @param newInfo(null/string): the new information (display only)
 *
 * @param action(null/true/function):
 *    null: action impossible
 *    true: info message of success
 *    fn: fix function
 */
module.exports.fileMsg = function (file, code, description, newInfo = null, action = null) {
	const k = file.getRelativePath();

	file.errors.push(code);
	if (!messagesPerFiles[k]) {
		messagesPerFiles[k] = '';
	}

	if (!(k in messagesPerFiles)) {
		module.exports.fileStart(file);
	}

	messagesPerFiles[k] += '\n  ';
	messagesPerFiles[k] += action;
	messagesPerFiles[k] += (description ? ' ' + chalk.yellow.bold((description).padEnd(30, ' ')) : '');
	messagesPerFiles[k] += (newInfo     ? ' ' + chalk.blue('' + newInfo) : '');

	dumpStats();
};

module.exports.oneLine = async function (file, cb) {
	let icon = IconImpossible;
	try {
		const result = await cb(file);
		switch(result) {
		case undefined:
		case true:
			icon = IconSuccess;
			break;
		case false:
			icon = IconFailure;
			break;
		case null:
			icon = IconSkipped;
			break;
		}
		console.info(`${icon} ${file.getRelativePath()}`);
	} catch(e) {
		console.info(`${IconFailure} ${file.getRelativePath()}: ${chalk.red(e.getMessage())}`);
	}
};
