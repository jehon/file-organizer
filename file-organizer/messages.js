
const ansiEscapes = require('ansi-escapes');
require('colors');
const chalk = require('chalk');

const options = require('./options.js');

const IconSuccess = chalk.green('✓');
const IconFailure = chalk.red.bold('✘');
const IconSkipped = chalk.magenta('⚐');

module.exports.IconSuccess = IconSuccess;
module.exports.IconFailure = IconFailure;
module.exports.IconSkipped = IconSkipped;

const stats = {
    pendingFiles: 0,
    filesTotal: 0,
    fixesTotal: 0,
    errorsTotal: 0,
    fixesSkipped: 0,
};
module.exports.stats = stats;

module.exports.statsSetPendingFiles = function (i) {
    stats.pendingFiles = i;
    dumpStats();
};

module.exports.statsAddFileToTotal = function (i = 1) {
    stats.filesTotal += i;
    dumpStats();
};

module.exports.statsAddFixToTotal = function () {
    stats.fixesTotal++;
    dumpStats();
};

module.exports.statsAddErrorToTotal = function () {
    stats.errorsTotal++;
    dumpStats();
};

module.exports.statsAddSkippedFix = function () {
    stats.fixesSkipped++;
    dumpStats();
};

// const messagesPerFiles = {};

function cleanLine() {
    if (options.withStats) {
        // Force being at the beginnning of the line
        process.stdout.write(ansiEscapes.eraseLine);
        process.stdout.write(ansiEscapes.cursorTo(0));
    }

}
module.exports.cleanLine = cleanLine;

function dumpStats() {
    if (options.withStats) {
        cleanLine();

        // Write infos on one line, erase it after
        process.stdout.write(
            (('* '
				// + (concurrencyLimit.pendingCount > 0 ? concurrencyLimit.pendingCount + ': ' : '')
				+ `Total files: ${stats.filesTotal}`
				+ (stats.pendingFiles                    > 0 ? ` - pending: ${stats.pendingFiles}` : '')
				+ (stats.fixesTotal                      > 0 ? ` - fixes: ${stats.fixesTotal}` : '')
				+ (stats.fixesSkipped                    > 0 ? ` - skipped: ${stats.fixesSkipped}` : '')
				+ (stats.errorsTotal                     > 0 ? ` - errors: ${stats.errorsTotal}` : '')
            )
            // + ' '
            // + folders.join(',')
            ).substr(0, process.stdout.columns - 1).white.bgCyan
        );
    }
}
module.exports.dumpStats = dumpStats;

function writeLine(args) {
    cleanLine();
    process.stdout.write(args + '\n');
    dumpStats();
}
module.exports.writeLine = writeLine;

function notifyError(e) {
    cleanLine();
    console.error('!! ');
    console.error('!! Error: ', e.getMessage ? e.getMessage() : '', e);
    console.error('!! ');
}
module.exports.notifyError = notifyError;
