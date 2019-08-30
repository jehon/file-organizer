
const FileFactory = require('../file-factory.js');

exports.command = 'info <key> <file>';

exports.describe = 'Get some info about the file';

exports.builder = {
	key: {
		default: 'exiv.comment'
	},
	file: {
		coerce: val => FileFactory(val)
	}
};

exports.handler = async function (options) {
	await options.file.loadData();
	console.info(options.file.getInfo(options.key));
};
