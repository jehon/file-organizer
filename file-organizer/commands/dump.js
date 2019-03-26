
exports.command = 'dump [file]';

exports.describe = 'Get some info about the files';

exports.handler = function (options) {
	options.file.iterate(async function(f) {
		console.info(f.getFilename().padEnd(60),
			'|', f.getInfo('picture.exiv.timestamp').padEnd(22),
			'|', f.getInfo('picture.exiv.comment'.padEnd(20)),
			'|', f.getInfo('timestamp.comment'),
			'|', f.getInfo('timestamp.original')
		);
	}).then(() => {
		console.info('\n\nDone');
	});
};
