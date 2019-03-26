
exports.command = 'dump [file]';

exports.describe = 'Get some info about the files';

exports.handler = function (options) {
	options.file.iterate(async function(f) {
		console.info(f.getFilename().padEnd(80), '|', f.getInfo('picture.exiv.timestamp').padEnd(22), '|', f.getInfo('picture.exiv.comment'));
	}).then(() => {
		console.info('\n\nDone');
	});
};
