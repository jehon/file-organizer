
const ShellTask = require('../../file-organizer/main/shell-task.js');
const messenger = require('../../file-organizer/main/messenger.js');

describe('shell-task-test', function () {
    beforeEach(() => {
        spyOn(messenger, 'notify').and.returnValue(true);
        spyOn(ShellTask.prototype, 'notify').and.callThrough();
    });

    it('should run a simple task', async function () {
        const t = new ShellTask({ id: 1 }, 'task test',
            ['ls', '/']
        );
        const res = await t.run();
        expect(res.details).toContain('dev');
        expect(res.success).toBeTruthy();
    });

    it('should run a simple task that fail', async function () {
        const t = new ShellTask({ id: 1 }, 'task test',
            ['anything']
        );
        try {
            await t.run();
            expect(false)
                .withContext('should be rejected')
                .toBeTruthy();
        } catch (e) {
            expect(e.messages).toContain(' anything ENOENT');
        }
    });
});
