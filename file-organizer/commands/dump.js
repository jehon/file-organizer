
const options = require('../options.js');
const messages = require('../messages.js');
const { cleanLine } = require('../messages.js');

exports.command = 'dump [files..]';

exports.describe = 'Get some info about the files';

const padFilename  = 50;
const padExtension = 5;
const padTimestamp = 22;
const padComment   = 50;
const padFolder    = 20;

function l(str, ll) {
	if (str.length > ll) {
		str = str.substr(0, ll - 1) + '…';
	}
	return str.padEnd(ll);
}

function r(str, ll) {
	if (str.length > ll) {
		str = '…' + str.substr(-ll + 1) + '';
	}
	return str.padEnd(ll);
}

exports.handler = function (noptions) {
	Object.assign(options, noptions, {
		dryRun: true
	});
	options.dryRun = true;
	options.withFileSummary = false;
	options.withStats = false;

	console.info('  '
		+ l('filename', padFilename)
		+ '|'
		+ l('ext', padExtension)
		+ '|'
		+ l('timestamp', padTimestamp)
		+ '|'
		+ l('comment', padComment)
		+ '|'
		+ l('folder', padFolder)
	);
	console.info('-'.repeat(padFilename + padExtension + padTimestamp + padComment + padFolder + 5));

	return Promise.all(options.files.map(f0 =>
		f0.iterate(
			f => f.loadData()
				.then(f => { f.check(); return f; })
				.then(f => {
					cleanLine();
					let msg = ''
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
						+ '|'
						+ r(f.parent.getRelativePath(), padFolder)
						;

					if (f.stats.skipped > 0) {
						console.info(messages.IconSkipped + ' '  + msg.yellow);
					} else {
						console.info(messages.IconSuccess + ' ' + msg);
					}

				})
		)))
		.then(() => {
			console.info('\n\nDone');
		});
};
