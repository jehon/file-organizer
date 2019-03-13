#!/usr/bin/env nodejs

const options = require('./options.js');
const FileFactory = require('./file-factory.js');

options.initialize();

const ff = FileFactory(options.source);

ff.iterate(async function(f) {
	await f.check();
}).then(() => {
	console.info('\n\nDone');
});
