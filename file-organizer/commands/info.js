
const fileFactory = require('../file-factory.js');

exports.command = 'info <key> <file>';

exports.describe = 'Get some info about the file';

exports.builder = {
	key: {
		default: 'exiv.comment'
	},
	file: {
		type: 'string'
	}
};

exports.handler = async function (options) {
	fileFactory(options.file)
		.then(f => f.loadData())
		.then(f => console.info(f.getInfo(options.key)));
};
