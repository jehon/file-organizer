
const isInteractive = require('is-interactive');

const defaultOptions = {
    dryRun: false,
    withFileSummary: isInteractive(),
    showHidden: false,
    headless: false
};

const options = {};

function resetToDefault() {
    for (var member in options) delete options[member];
    Object.assign(options, defaultOptions);
    options.resetToDefault = resetToDefault;
}

resetToDefault();

module.exports = options;
