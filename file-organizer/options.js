
const defaultOptions = {
	interactive: true,
	dryRun: false,
	withFileSummary: true,
	withStats: true
};

const options = {};

function resetToDefault() {
	for (var member in options) delete options[member];
	Object.assign(options, defaultOptions);
	options.resetToDefault = resetToDefault;
}

resetToDefault();

module.exports = options;
