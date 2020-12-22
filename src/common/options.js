
import isInteractive from 'is-interactive';

const defaultOptions = {
    dryRun: false,
    withFileSummary: isInteractive(),
    showHidden: false,
    headless: false,
    debug: false
};

const options = {};
export default options;

/**
 * For testing purpose
 */
export function _resetToDefault() {
    for (var member in options) delete options[member];
    Object.assign(options, defaultOptions);
    options._resetToDefault = _resetToDefault;
}

_resetToDefault();
