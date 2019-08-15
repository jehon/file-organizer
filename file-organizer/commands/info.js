
exports.command = 'info <key> [file]';

exports.describe = 'Get some info about the file';

exports.builder = {
	key: {
		default: 'exiv.comment'
	}
};

exports.handler = async function (options) {
	await options.file.loadData();
	let i = options.file.getInfo(options.key);
	if (i) {
		console.info(i);
	}
};
