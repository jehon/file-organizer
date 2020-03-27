
const ShellTask = require('../../file-organizer/main/tasks/shell-task.js');
const messenger = require('../../file-organizer/messenger.js');

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
        const res = await t.run();
        expect(res.messages).toContain(' anything ENOENT');
        expect(res.success).toBeFalsy();
    });
});
