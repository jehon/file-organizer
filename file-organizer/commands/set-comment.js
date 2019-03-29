
const messages = require('../messages.js');

exports.command = 'set-comment <comment> [file]';

exports.describe = 'Get some info about the file';

// exports.builder = {
// 	comment: {
// 		default: 'exiv.comment'
// 	}
// };

exports.handler = function (options) {
	options.file.iterate(function(f) {
		if (typeof(f.setComment) == 'function') {
			messages.oneLine(f, (f) => f.setComment(options.comment));
		}
	});
};
