
const { basename } = require('path');

const ShellTask = require('../../file-organizer/main/shell-task.js');
const messenger = require('../../file-organizer/main/messenger.js');

describe(basename(__filename), function () {
    beforeEach(() => {
        spyOn(messenger, 'notify').and.returnValue(true);
        spyOn(ShellTask.prototype, 'notify').and.callThrough();
    });

    it('should run a simple task', async function () {
        const t = new ShellTask('task test',
            ['ls', '/']
        );
        await expectAsync(t.run()).toBeResolvedTo(jasmine.stringMatching(/.*\ndev\n.*/));
    });

    it('should run a simple task that fail', async function () {
        const t = new ShellTask('task test',
            ['ls', '/anything']
        );

        await expectAsync(t.run())
            .toBeRejectedWithError(/.*ls: cannot access '\/anything': No such file or directory/);
    });

    it('should be ok without output', async function () {
        const t = new ShellTask('task test',
            ['true']
        );

        await expectAsync(t.run())
            .toBeResolved();
    });

    it('should fail when exit code is not 0', async function () {
        const t = new ShellTask('task test',
            ['false']
        );

        await expectAsync(t.run())
            .toBeRejectedWithError('Command failed: false');
    });
});
