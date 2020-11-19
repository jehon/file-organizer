
import { t } from '../test-helper.js';

import ShellTask from '../../src/main/task-shell.js';
import { } from '../../src/main/messenger.js';

describe(t(import.meta), function () {
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
