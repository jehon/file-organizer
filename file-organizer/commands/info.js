
const messages = require('../messages.js');
const options = require('../options.js');
const fileFactory = require('../file-factory.js');

exports.command = 'info <file>';

exports.describe = 'Get some info about the file';

exports.builder = {
	key: {
		alias: [ 'k' ],
		default: ''
	},
	file: {
		type: 'string'
	}
};

exports.handler = async function (noptions) {
	Object.assign(options, noptions, {
		dryRun: true,
		withStats: false,
		withFileSummary: false
	});

	fileFactory(options.file)
		.then(f => f.loadData())
		.then(f => {
			if (options.key) {
				messages.writeLine(f.getInfo(options.key));
			} else {
				messages.writeLine(JSON.stringify(f.getAllInfos(), null, 2));
			}
		});
};
