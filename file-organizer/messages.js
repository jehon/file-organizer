
const ansiEscapes = require('ansi-escapes');
const getCursorPosition = require('get-cursor-position');
const chalk = require('chalk');

const options = require('./options.js');
const BusinessError = require('./business-error.js');
// const { ellipseLeft } = require('./string-utils.js');

const IconSuccess = chalk.green('✓');
const IconFailure = chalk.red.bold('✘');
const IconTodo    = chalk.red('⚑');
const IconSkipped = chalk.magenta('⚐');

const stats = {
	filesCount: 0,
	fixesCount: 0,
	errorsCount: 0,
	skippedCount: 0,
	impossibleCount: 0
};
module.exports.stats = stats;

let lastLogFile = false;

/**
 * !! Await on this one: await file.checkMsg(...)
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
module.exports.checkMsg = async function (file, code, description, newInfo = null, action = null) {
	let msg = '';

	file.errors.push(code);

	if (options.interactive) {
		// Force being at the beginnning of the line
		const cursorPos = getCursorPosition.sync();
		if (cursorPos.col >  0) {
			process.stdout.write(ansiEscapes.eraseLine);
			process.stdout.write(ansiEscapes.cursorTo(0));
		}
	}

	if (lastLogFile != file) {
		msg += '\n';
		msg += (file.getFilename() + file.getExtension()) + ' /' + chalk.gray(file.parent.getRelativePath()) + '/\n';

		lastLogFile = file;
	}

	msg += '  ';

	let res = false;
	// This will be changed by the 'action'

	if (action === null) {
		msg += IconTodo;
		stats.impossibleCount++;
	} else if (action === true) {
		msg += IconSuccess;
		res = true;
	} else {
		if (!options.dryrun) {
			try {
				res = await action();
			} catch (e) {
				if (e instanceof BusinessError) {
					console.error('Error: ', e.getMessage ? e.getMessage() : '');
				} else {
					console.error('Error: ', e);
					stats.errorsCount++;
				}
			}
			if (res === undefined) {
				res = true;
			}
			if (res) {
				msg += IconSuccess;
				stats.fixesCount++;
			} else {
				msg += IconFailure;
				stats.errorsCount++;
			}
		} else {
			msg +=  IconSkipped;
			stats.skippedCount++;
		}
	}

	msg += ' ';
	msg += chalk.yellow.bold((description).padEnd(30, ' '));

	msg += ' ';
	msg += (newInfo != null ? chalk.blue('' + newInfo) : '');

	if (options.interactive) {
		process.stdout.write(msg + '\n');
	} else {
		process.stdout.write(msg + '\n');
	}
	return res;
};

module.exports.oneLine = function (file, result) {
	let icon = IconTodo;
	switch(result) {
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
};


