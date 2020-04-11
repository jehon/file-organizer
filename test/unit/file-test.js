

const File = require('../../file-organizer/main/file.js');
const Task = require('../../file-organizer/main/task.js');
const messenger = require('../../file-organizer/main/messenger.js');

const { TYPE_FILE,
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS,
    STATUS_FAILURE,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../../file-organizer/constants.js');

class DemoFile extends File {
    withAnalyse(fn) {
        this.fnAnalyse = fn;
        return this;
    }

    async analyse() {
        return super.analyse()
            .then(this.fnAnalyse);
    }
}

fdescribe('file-test', function () {
    describe('state machine', () => {
        let f;

        beforeEach(() => {
            spyOn(messenger, 'notify').and.returnValue(true);
            spyOn(File.prototype, 'notify').and.callThrough();

            f = new DemoFile('file-test');
        });

        it('should analyse a file already ok', async function () {
            f.withAnalyse(() => true);

            let i = 0;
            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);

            await expectAsync(f.runAnalyse())
                .toBeResolvedTo(true);

            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ANALYSING);
            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_SUCCESS);
            expect(File.prototype.notify).toHaveBeenCalledTimes(i);

            await expectAsync(f.act()).toBeResolvedTo(true);
            expect(File.prototype.notify).toHaveBeenCalledTimes(i);
        });

        it('should analyse a file impossible', async function () {
            f.withAnalyse(() => { throw 'impossible'; });

            let i = 0;
            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);

            await expectAsync(f.runAnalyse())
                .toBeRejectedWith('impossible');

            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ANALYSING);
            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_FAILURE);
            expect(File.prototype.notify).toHaveBeenCalledTimes(i);

            await expectAsync(f.act()).toBeResolvedTo(false);
            expect(File.prototype.notify).toHaveBeenCalledTimes(i);
        });

        it('should analyse a file by tasks', async function () {
            f.withAnalyse(() => { f.createAndRun(Task, 'test', () => true); });

            let i = 0;
            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);

            await expectAsync(f.runAnalyse())
                .toBeResolved();

            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ANALYSING);
            expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_SUCCESS);
            expect(File.prototype.notify).toHaveBeenCalledTimes(i);

            await expectAsync(f.act()).toBeResolvedTo(true);
            expect(File.prototype.notify).toHaveBeenCalledTimes(i);
        });

        describe('with tasks', function () {
            let t;

            beforeEach(() => {
                f.withAnalyse(() => f.enqueueAct(t));
            });

            it('with successfull task', async function () {
                let i = 0;
                t = new Task('test task', () => true);

                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
                await expectAsync(f.runAnalyse()).toBeResolved();
                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ANALYSING);
                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.act()).toBeResolvedTo(true);
                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_SUCCESS);

                expect(File.prototype.notify).toHaveBeenCalledTimes(i);
            });

            it('with failing task', async function () {
                let i = 0;
                t = new Task('test task', () => { throw 'impossible'; });

                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_CREATED);
                await expectAsync(f.runAnalyse()).toBeResolved();
                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ANALYSING);
                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.act()).toBeRejectedWith('impossible');
                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTING);
                expect(File.prototype.notify.calls.argsFor(i++)[0]).toBe(STATUS_ACTED_FAILURE);

                expect(File.prototype.notify).toHaveBeenCalledTimes(i);
            });
        });
    });
});
