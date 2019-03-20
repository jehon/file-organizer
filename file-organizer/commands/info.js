
exports.command = 'info <key> [file]';

exports.describe = 'Get some info about the file';

exports.builder = {
	key: {
		default: 'exiv.comment'
	}
};

exports.handler = function (options) {
	console.info(options.file.getInfo(options.key));
};