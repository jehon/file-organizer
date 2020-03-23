
const Task = require('../../file-organizer/main/tasks/task.js');
const options = require('../../file-organizer/options.js');
const messenger = require('../../file-organizer/messenger.js');

const {
    TASK_CREATED,
    TASK_SKIPPED,
    TASK_STARTED,
    TASK_SUCCESS,
    TASK_FAILURE,
    TASK_FINALLY } = require('../../file-organizer/constants.js');

describe('task-test', function () {
    beforeEach(() => {
        spyOn(messenger, 'notify').and.returnValue(true);
        spyOn(Task.prototype, 'notify').and.callThrough();
    })

    it('should run a simple task', async function () {
        const t = new Task({ id: 1 }, 'task test',
            () => { }
        );
        const res = await t.run();
        expect(res.success).toBeTruthy();
        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_STARTED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_SUCCESS);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_FINALLY);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
    })

    it('should run a simple task with true', async function () {
        const t = new Task({ id: 1 }, 'task test',
            () => true
        );
        const res = await t.run();
        expect(res.success).toBeTruthy();
        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_STARTED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_SUCCESS);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_FINALLY);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
    })

    it('should run a simple task with false', async function () {
        const t = new Task({ id: 1 }, 'task test',
            () => false
        );
        const res = await t.run();
        expect(res.success).toBeFalsy();
        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_STARTED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_FAILURE);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_FINALLY);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
    })

    it('should run a simple task with error', async function () {
        const t = new Task({ id: 1 }, 'task test',
            () => { throw "new error"; }
        );
        const res = await t.run();
        expect(res.success).toBeFalsy();
        expect(res.messages).toBe('new error');
        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_STARTED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_FAILURE);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_FINALLY);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
    })

    it('should run a simple task with message', async function () {
        const t = new Task({ id: 1 }, 'task test',
            function () { this.messages = "euh"; }
        );
        const res = await t.run();
        expect(res.success).toBeTruthy();
        expect(res.messages).toBe('euh');
        expect(messenger.notify).toHaveBeenCalledTimes(4);
    })

    it('should run if not dryRun', async function () {
        options.dryRun = false;
        const t = new Task({ id: 1 }, 'task test',
            function () { this.messages = "euh"; }
        );
        const res = await t.runIfCommit();
        expect(res.skipped).toBeFalsy();
        expect(res.success).toBeTruthy();
        expect(res.messages).toBe('euh');
        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_STARTED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_SUCCESS);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_FINALLY);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
    })

    it('should not run if dryRun', async function () {
        options.dryRun = true;
        const t = new Task({ id: 1 }, 'task test',
            function () { this.messages = "euh"; }
        );
        const res = await t.runIfCommit();
        expect(res.skipped).toBeTruthy();
        expect(res.success).toBeFalsy();
        expect(res.messages).toBe('');
        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_SKIPPED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(TASK_FINALLY);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
    })
});
