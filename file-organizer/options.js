
const isInteractive = require('is-interactive');

const defaultOptions = {
    dryRun: false,
    withFileSummary: isInteractive(),
    showHidden: false,
    headless: false,
    debug: false
};

const options = {};

/**
 * For testing purpose
 */
function _resetToDefault() {
    for (var member in options) delete options[member];
    Object.assign(options, defaultOptions);
    options._resetToDefault = _resetToDefault;
}

_resetToDefault();

module.exports = options;

// For testing purpose
options._resetToDefault = _resetToDefault;
