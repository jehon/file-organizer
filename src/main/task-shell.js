
import childProcess from 'child_process';
import Task from './task.js';

import mainDebug from './debug.js';
const debug = mainDebug.extend('TaskShell');

export default class TaskShell extends Task {
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
}
