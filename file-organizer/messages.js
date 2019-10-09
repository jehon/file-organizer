
const ansiEscapes = require('ansi-escapes');
require('colors');
const chalk = require('chalk');

const options = require('./options.js');
// const { ellipseLeft } = require('./string-utils.js');

const IconSuccess = chalk.green('✓');
const IconFailure = chalk.red.bold('✘');
const IconSkipped = chalk.magenta('⚐');

module.exports.IconSuccess    = IconSuccess;
module.exports.IconFailure    = IconFailure;
module.exports.IconSkipped    = IconSkipped;

const stats = {
	filesTotal: 0,
	fixesTotal: 0,
	errorsTotal: 0,
	fixesSkipped: 0,
};

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
	if (options.interactive && options.withStats) {
		cleanLine();

		// Write infos on one line, erase it after
		process.stdout.write(
			(('* '
				// + (concurrencyLimit.pendingCount > 0 ? concurrencyLimit.pendingCount + ': ' : '')
				+ `Total files: ${stats.filesTotal}`
				+ (Object.keys(messagesPerFiles).length  > 0 ? ` - pending: ${Object.keys(messagesPerFiles).length}` : '')
				+ (stats.fixesTotal                      > 0 ? ` - fixes: ${stats.fixesTotal}` : '')
				+ (stats.fixesSkipped                    > 0 ? ` - skipped: ${stats.fixesSkipped}` : '')
				+ (stats.errorsTotal                     > 0 ? ` - errors: ${stats.errorsTotal}` : '')
			)
			+ ' '
			+ folders.join(',')).substr(0, process.stdout.columns - 1).white.bgCyan
		);
	}
}

module.exports.fileStart = function(file) {
	const k = file.getRelativePath();
	if (!(k in messagesPerFiles)) {
		const FileFoder = require('./file-folder.js');
		if (file instanceof FileFoder) {
			folders.push(file.getRelativePath());
		} else {
			messagesPerFiles[k] = '';
			stats.filesTotal++;
		}
	}
	dumpStats();
};

module.exports.fileEnd = function(file) {
	const k = file.getRelativePath();
	if (k in messagesPerFiles && messagesPerFiles[k]) {
		if (options.withFileSummary) {
			cleanLine();
			process.stdout.write(
				'*** '
				+ file.parent.getRelativePath() + '/' + chalk.bold(file.getFilename()) + file.getExtension()
				+ (file._originalFilePath != file.getRelativePath() ? '\n  < ' + file._originalFilePath : '')
				+ messagesPerFiles[k]
				+ '\n\n'
			);
		}
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
		file.stats.fixSkipped++;
		stats.fixesSkipped++;
	} else {
		try {
			res = await action();

			if (res === undefined) {
				res = true;
			}
			if (res) {
				msg = IconSuccess;
				file.stats.fixed++;
				stats.fixesTotal++;
			} else {
				msg = IconFailure;
				file.stats.errors++;
				stats.errorsTotal++;
			}
		} catch (e) {
			cleanLine();
			console.error('!! ');
			console.error('!! Error: ', e.getMessage ? e.getMessage() : '', e);
			console.error('!! ');
			file.stats.errors++;
			stats.errorsTotal++;
			res = false;
		}
	}

	module.exports.fileMsg(file, code, description, newInfo, msg);
	return res;
};

module.exports.fileImpossible = function(file, code, description) {
	file.stats.errors++;
	stats.errorsTotal++;
	module.exports.fileMsg(file, code, description, null, IconFailure);
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
 *    null: action errors (impossible)
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
	messagesPerFiles[k] += (description ? ' ' + chalk.yellow((description).padEnd(40, ' ')) : '');
	messagesPerFiles[k] += (newInfo     ? ' ' + chalk.blue('' + newInfo) : '');

	dumpStats();
};
