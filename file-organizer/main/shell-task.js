
const childProcess = require('child_process');
const Task = require('./task.js');

const debug = require('debug')('shell-task');

module.exports = class ShellTask extends Task {
    constructor(title, params) {
        super(title, () => this.runInShell(params));
    }

    runInShell(params) {
        const execFile = params.shift();
        debug(execFile, ...params);

        return new Promise((resolve, reject) => {
            childProcess.execFile(execFile, params, (error, stdout, stderr) => {
                debug(execFile, ...params, '->', stdout, '#', stderr, '#', error);
                if (!stdout) {
                    stdout = '';
                }
                if (!stderr) {
                    stderr = '';
                }
                this.details = (stdout + '\n' + stderr).trim();
                if (error) {
                    // if (error instanceof Error) {
                    error.message = error.message.trim();
                    this.messages = error.message + '-';
                    // } else {
                    //     this.messages = error;
                    //     error = new Error(error);
                    // }
                    return reject(error);
                }
                resolve(stdout);
            });
        });
    }
};
