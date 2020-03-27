
require('colors');
const chalk = require('chalk');

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
};

module.exports.statsAddFileToTotal = function (i = 1) {
    stats.filesTotal += i;
};

module.exports.statsAddFixToTotal = function () {
    stats.fixesTotal++;
};

module.exports.statsAddErrorToTotal = function () {
    stats.errorsTotal++;
};

module.exports.statsAddSkippedFix = function () {
    stats.fixesSkipped++;
};

function notifyError(e) {
    console.error('!! ');
    console.error('!! Error: ', e.getMessage ? e.getMessage() : '', e);
    console.error('!! ');
}
module.exports.notifyError = notifyError;
