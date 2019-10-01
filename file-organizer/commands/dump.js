
const options = require('../options.js');
const FileUnsupported = require('../file-unsupported.js');
const messages = require('../messages.js');
const { cleanLine } = require('../messages.js');

exports.command = 'dump [files..]';

exports.describe = 'Get some info about the files';

exports.builder = {
	all: {
		type: 'boolean',
		default: false
	}
};

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

	return Promise.all(options.files.map(
		f0 => f0.iterate(
			fi => fi.loadData()
				.then(async fi => { await fi.check(); return fi; })
				.then(fi => {
					const ok = fi.stats.skipped == 0;
					if (!options.all && ok) {
						// Display only problems
						return;
					}
					const sep = (ok) ? '|' : '|';
					cleanLine();
					let msg = ''
						+ r(fi.parent.getRelativePath() + '/' + fi.getFilename(), padFilename)
						+ sep
						+ l(fi.getInfo('file.extension'), padExtension)
						+ sep
						+ (fi.getInfo('exiv.timestamp')
							? l(fi.getInfo('exiv.timestamp'), padTimestamp)
							: messages.IconFailure + ' ' + l(fi.getInfo('timestamp.original'), padTimestamp - 2).red
						)
						+ sep
						+ (fi.getInfo('exiv.comment')
							? l(fi.getInfo('exiv.comment'), padComment)
							: messages.IconFailure + ' ' + l(fi.getInfo('timestamp.comment'), padComment - 2).red
						)
						;

					if (ok) {
						console.info(messages.IconSuccess + ' ' + msg);
					} else {
						console.info(messages.IconFailure + ' '  + msg.red);
					}

				})
		))
	)
		.then(() => {
			console.info('\n\n');
			FileUnsupported.dumpDiscoveredExtension();
		});
};
