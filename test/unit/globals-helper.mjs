

import path from 'path';

// import fs from 'fs';
// const logFile = path.join(__dirname, 'tmp/app/log.log');

/**
 * @see https://stackoverflow.com/a/29581862/1954789
 *
 * @returns {string} the calling filename
 */
function _getCallerFileAndLine() {
    var originalFunc = Error.prepareStackTrace;

    var caller = '';
    try {
        var err = new Error();
        var currentfile;

        Error.prepareStackTrace = function (err, stack) { return stack; };
        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            caller = err.stack.shift();
            if (currentfile !== caller.getFileName()) break;
        }

        Error.prepareStackTrace = originalFunc;

        let callerfile = caller.getFileName();
        if (callerfile.startsWith('internal')) {
            callerfile = currentfile;
        }

        callerfile = callerfile.replace('file:', '');
        callerfile = path.relative(process.cwd(), callerfile);

        return callerfile + '#' + caller.getLineNumber();

    } catch (e) {
        true;
    }
    return '?';
}

/**
 * @param {any} msg the message
 */
function jx(...msg) {
    const fmsg = ''
        + _getCallerFileAndLine().padEnd(30)
        + ((msg.length > 0) ?
            (': '
                + msg
                    .map(v => typeof (v) == 'object' ? JSON.stringify(v, null, 2) : v)
                    .join(' '))
            : '')
        + '\n';

    // fs.appendFileSync(logFile, fmsg);
    console.log(fmsg); /* eslint-disable-line */
}

global.jx = jx;

