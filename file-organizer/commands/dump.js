
const messages = require('../messages.js');
const { cleanLine } = require('../messages.js');

exports.command = 'dump [files..]';

exports.describe = 'Get some info about the files';

const padFilename  = 55;
const padExtension = 5;
const padTimestamp = 22;
const padComment   = 20;

exports.handler = function (options) {
	console.info('filename'.padEnd(padFilename),
		'|', 'fext'.padEnd(padExtension),
		'|', 'ts.comment'.padEnd(padComment),
		'|', 'ts.original',
		'|', 'pict.e.timestamp'.padEnd(padTimestamp),
		'|', 'pict.e.comment'.padEnd(padComment),
	);
	console.info('-'.repeat(125));

	return Promise.all(options.files.map(f0 =>
		f0.iterate(
			f => messages.concurrencyLimit(() => f.loadData())
				.then(f => {
					cleanLine();
					console.info(f.getFilename().padEnd(padFilename),
						'|', f.getInfo('file.extension').padEnd(padExtension),
						'|', f.getInfo('timestamp.comment').padEnd(padComment),
						'|', f.getInfo('timestamp.original'),
						'|', f.getInfo('picture.exiv.timestamp').padEnd(padTimestamp),
						'|', f.getInfo('picture.exiv.comment').padEnd(padComment),
					);
				})
		)))
		.then(() => {
			console.info('\n\nDone');
		});
};
