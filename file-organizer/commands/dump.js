
const options = require('../options.js');
const messages = require('../messages.js');
const { cleanLine } = require('../messages.js');

exports.command = 'dump [files..]';

exports.describe = 'Get some info about the files';

const padFilename  = 50;
const padExtension = 5;
const padTimestamp = 22;
const padComment   = 55;

function l(str, ll) {
	if (str.length > ll) {
		str = str.substring(0, ll - 1) + '';
	}
	return str.padEnd(ll);
}

exports.handler = function (noptions) {
	Object.assign(options, noptions, {
		dryRun: true
	});
	options.dryRun = true;

	console.info(l('filename', padFilename)
		+ '|'
		+ l('ext', padExtension)
		+ '|'
		+ l('timestamp', padTimestamp)
		+ '|'
		+ l('comment', padComment),
	);
	console.info('-'.repeat(padFilename + padExtension + padTimestamp + padComment + 4));

	return Promise.all(options.files.map(f0 =>
		f0.iterate(
			f => f.loadData()
				.then(f => {
					cleanLine();
					console.info(
						messages.IconSkipped
						+ l(f.getFilename(), padFilename)
						+ '|'
						+ l(f.getInfo('file.extension'), padExtension)
						+ '|'
						+ l((
							f.getInfo('exiv.timestamp')
								? '*: ' + f.getInfo('exiv.timestamp')
								: 'F: ' + f.getInfo('timestamp.original')
						), padTimestamp)
						+ '|'
						+ l((
							f.getInfo('exiv.comment')
								? '*: ' + f.getInfo('exiv.comment')
								: 'F: ' + f.getInfo('timestamp.comment')
						), padComment)
					);
				})
		)))
		.then(() => {
			console.info('\n\nDone');
		});
};
