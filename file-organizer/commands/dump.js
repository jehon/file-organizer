
const options = require('../options.js');
const messages = require('../messages.js');
const { cleanLine } = require('../messages.js');

exports.command = 'dump [files..]';

exports.describe = 'Get some info about the files';

const padFilename  = 60;
const padExtension = 5;
const padTimestamp = 22;
const padComment   = 50;

function l(str, ll) {
	if (str.length > ll) {
		str = str.slice(0, ll - 1) + '…';
	}
	return str.padEnd(ll);
}

function r(str, ll) {
	if (str.length > ll) {
		str = '…' + str.slice(-ll + 1) + '';
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
	);
	console.info('-'.repeat(padFilename + padExtension + padTimestamp + padComment + 4));

	return Promise.all(options.files.map(f0 =>
		f0.iterate(
			f => f.loadData()
				.then(f => { f.check(); return f; })
				.then(f => {
					const sep = (f.stats.skipped > 0) ? '|' : '|';
					cleanLine();
					let msg = ''
						+ r(f.parent.getRelativePath() + '/' + f.getFilename(), padFilename)
						+ sep
						+ l(f.getInfo('file.extension'), padExtension)
						+ sep
						+ (f.getInfo('exiv.timestamp')
							? l(f.getInfo('exiv.timestamp'), padTimestamp)
							: messages.IconFailure + ' ' + l(f.getInfo('timestamp.original'), padTimestamp - 2).red
						)
						+ sep
						+ (f.getInfo('exiv.comment')
							? l(f.getInfo('exiv.comment'), padComment)
							: messages.IconFailure + ' ' + l(f.getInfo('timestamp.comment'), padComment - 2).red
						)
						;

					if (f.stats.skipped > 0) {
						console.info(messages.IconFailure + ' '  + msg.red);
					} else {
						console.info(messages.IconSuccess + ' ' + msg);
					}

				})
		)))
		.then(() => {
			console.info('\n\nDone');
		});
};
