
exports.command = 'dump [file]';

exports.describe = 'Get some info about the files';

const padFilename  = 55;
const padTimestamp = 22;
const padComment   = 20;

exports.handler = function (options) {
	console.info('filename'.padEnd(padFilename),
		'|', 'pict.e.timestamp'.padEnd(padTimestamp),
		'|', 'pict.e.comment'.padEnd(padComment),
		'|', 'ts.comment'.padEnd(padComment),
		'|', 'ts.original'
	);
	console.info('-'.repeat(125));
	options.file.iterate(function(f) {
		console.info(f.getFilename().padEnd(padFilename),
			'|', f.getInfo('picture.exiv.timestamp').padEnd(padTimestamp),
			'|', f.getInfo('picture.exiv.comment').padEnd(padComment),
			'|', f.getInfo('timestamp.comment').padEnd(padComment),
			'|', f.getInfo('timestamp.original')
		);
	}).then(() => {
		console.info('\n\nDone');
	});
};
