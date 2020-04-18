
const { basename } = require('path');

const Task = require('../../file-organizer/main/task.js');
const { TaskSuccessFactory, TaskFailureFactory } = Task;
const messenger = require('../../file-organizer/main/messenger.js');

const { TYPE_TASK,
    STATUS_CREATED,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../../file-organizer/constants.js');

describe(basename(__filename), function () {
    beforeEach(() => {
        spyOn(messenger, 'notify').and.returnValue(true);
        spyOn(Task.prototype, 'notify').and.callThrough();
    });

    it('should have the correct type', function () {
        const t = new Task('task test', () => true);
        expect(t.type).toBe(TYPE_TASK);
    });

    it('should run a simple task', async function () {
        const t = new Task('task test', () => true);
        await expectAsync(t.run())
            .toBeResolvedTo(true);

        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_NEED_ACTION);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_SUCCESS);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
    });

    it('should run a simple task with true', async function () {
        const t = new Task('task test',
            () => true
        );
        await expectAsync(t.run())
            .toBeResolvedTo(true);

        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_NEED_ACTION);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_SUCCESS);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
    });

    it('should run a simple task with error', async function () {
        const t = new Task('task test', () => { throw 'new error'; });

        await expectAsync(t.run()).toBeRejected();

        // Should be rejected
        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_NEED_ACTION);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_FAILURE);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
    });

    it('should run a simple task with message', async function () {
        const t = new Task('task test', () => 'euh');
        await expectAsync(t.run()).toBeResolvedTo('euh');

        let i = 0;
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_NEED_ACTION);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
        expect(Task.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_SUCCESS);
        expect(Task.prototype.notify).toHaveBeenCalledTimes(i);
    });

    it('should work with subs', async function () {
        await expectAsync(TaskSuccessFactory('').run())
            .toBeResolvedTo('');
        await expectAsync(TaskSuccessFactory('euh').run())
            .toBeResolvedTo('euh');

        await expectAsync(TaskFailureFactory('').run())
            .toBeRejectedWithError();
        await expectAsync(TaskFailureFactory('euh').run())
            .toBeRejectedWithError('euh');
    });
});
