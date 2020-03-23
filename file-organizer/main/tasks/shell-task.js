
const childProcess = require('child_process');
const Task = require('./task.js');

const debug = require('debug')('shell-task');

module.exports = class ShellTask extends Task {
	constructor(file, title, params = []) {
		super(file, title, () => this.runInShell(params));
	}

	runInShell(params = []) {
		const file = params.shift();
		debug(file, ...params);

		return new Promise((resolve, _reject) => {
			childProcess.execFile(file, params, (error, stdout, stderr) => {
				debug(file, ...params, '->', stdout, '#', stderr, '#', error);
				if (!stdout) {
					stdout = '';
				}
				if (!stderr) {
					stderr = '';
				}
				this.details = stdout + '\n' + stderr;
				if (error) {
					if (error instanceof Error) {
						this.messages = error.message;
					} else {
						this.messages = error;
					}
					resolve(false);
				} else {
					resolve(true);
				}
			});
		});
	}
};
