
const Task = require('../../file-organizer/main/task.js');
const messenger = require('../../file-organizer/main/messenger.js');

const { TYPE_TASK,
    STATUS_CREATED,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../../file-organizer/constants.js');

describe('task-test', function () {
    beforeEach(() => {
        spyOn(messenger, 'notify').and.returnValue(true);
        spyOn(Task.prototype, 'notify').and.callThrough();
    });

    it('should run a simple task', async function () {
        const t = new Task({ id: 1 }, 'task test',
            () => { }
        );
        await expectAsync(t.run())
            .toBeResolvedTo(jasmine.objectContaining({ success: true }));

        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_SUCCESS);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify.calls.argsFor(0)[0].type).toBe(TYPE_TASK);
    });

    it('should run a simple task with true', async function () {
        const t = new Task({ id: 1 }, 'task test',
            () => true
        );
        await expectAsync(t.run())
            .toBeResolvedTo(jasmine.objectContaining({ success: true }));

        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_SUCCESS);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify.calls.argsFor(0)[0].type).toBe(TYPE_TASK);
    });

    it('should run a simple task with false', async function () {
        const t = new Task({ id: 1 }, 'task test',
            () => false
        );
        await expectAsync(t.run()).toBeRejected();

        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_FAILURE);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify.calls.argsFor(0)[0].type).toBe(TYPE_TASK);
    });

    it('should run a simple task with error', async function () {
        const t = new Task({ id: 1 }, 'task test',
            () => { throw 'new error'; }
        );

        await expectAsync(t.run()).toBeRejected();

        // Should be rejected
        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_FAILURE);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify).toHaveBeenCalledTimes(i);
        expect(messenger.notify.calls.argsFor(0)[0].type).toBe(TYPE_TASK);
    });

    it('should run a simple task with message', async function () {
        const t = new Task({ id: 1 }, 'task test',
            function () { this.messages = 'euh'; }
        );
        const res = await t.run();
        expect(res.success).toBeTruthy();
        expect(res.messages).toBe('euh');
        expect(messenger.notify).toHaveBeenCalledTimes(3);
        expect(messenger.notify.calls.argsFor(0)[0].type).toBe(TYPE_TASK);
    });
});
