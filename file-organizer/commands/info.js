
exports.command = 'info <key> [file]';

exports.describe = 'Get some info about the file';

exports.builder = {
	key: {
		default: 'exiv.comment'
	}
};

exports.handler = function (options) {
	console.log(options.file.getInfo(options.key));
	// do something with argv.
};