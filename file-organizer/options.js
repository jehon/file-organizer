

const defaultOptions = {};
defaultOptions.interactive = false;

const options = {};

function resetToDefault() {
	for (var member in options) delete options[member];
	Object.assign(options, defaultOptions);
	options.resetToDefault = resetToDefault;
}

resetToDefault();

module.exports = options;
