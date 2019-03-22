
exports.command = 'info <key> [file]';

exports.describe = 'Get some info about the file';

exports.builder = {
	key: {
		default: 'exiv.comment'
	}
};

exports.handler = function (options) {
	let i = options.file.getInfo(options.key);
	if (i) {
		console.info(i);
	}
};
