

const File = require('../../file-organizer/main/file.js');
const Task = require('../../file-organizer/main/task.js');
const messenger = require('../../file-organizer/main/messenger.js');

const {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS,
    STATUS_FAILURE,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} = require('../../file-organizer/constants.js');

const { getNotifyCallsForFile, getStatusHistoryForFile } = require('./helpers.js');
const options = require('../../file-organizer/options.js');
const { resetOptionsForUnitTesting } = require('./run-helper.js');

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

describe('file-test', function () {
    describe('state machine', () => {
        let f;

        beforeEach(() => {
            spyOn(messenger, 'notify').and.returnValue(true);
            spyOn(File.prototype, 'notify').and.callThrough();

            f = new DemoFile('file-test');
        });

        it('should analyse a file already ok', async function () {
            f.withAnalyse(() => true);

            expect(getNotifyCallsForFile(f, 0)[0]).toBe(STATUS_CREATED);

            await expectAsync(f.runAnalyse())
                .toBeResolvedTo(true);

            expect(getStatusHistoryForFile(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);

            await expectAsync(f.act()).toBeResolvedTo(true);
        });

        it('should analyse a file impossible', async function () {
            f.withAnalyse(() => { throw 'impossible'; });

            await expectAsync(f.runAnalyse())
                .toBeRejectedWith('impossible');

            expect(getStatusHistoryForFile(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);

            await expectAsync(f.act()).toBeResolvedTo(false);
        });

        it('should analyse a file by tasks', async function () {
            f.withAnalyse(() => { f.createAndRun(Task, 'test', () => true); });

            await expectAsync(f.runAnalyse())
                .toBeResolved();

            expect(getStatusHistoryForFile(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);

            await expectAsync(f.act()).toBeResolvedTo(true);
        });

        describe('with tasks', function () {
            let t;

            beforeEach(() => {
                f.withAnalyse(() => f.enqueueAct(t));
            });

            it('with successfull task', async function () {
                let i = 0;
                t = new Task('test task', () => true);

                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_CREATED);
                await expectAsync(f.runAnalyse()).toBeResolved();
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ANALYSING);
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.act()).toBeResolvedTo(true);
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ACTING);
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ACTED_SUCCESS);

                expect(getNotifyCallsForFile(f).length).toBe(i);
            });

            it('with failing task', async function () {
                let i = 0;
                t = new Task('test task', () => { throw 'impossible'; });

                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_CREATED);
                await expectAsync(f.runAnalyse()).toBeResolved();
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ANALYSING);
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.act()).toBeRejectedWith('impossible');
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ACTING);
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ACTED_FAILURE);

                expect(getNotifyCallsForFile(f).length).toBe(i);
            });


            describe('with legacy workflow', function () {

                it('with legacy workflow', async function () {
                    options.dryRun = false;
                    let i = 0;
                    t = Task.TaskSuccessFactory();

                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_CREATED);
                    await expectAsync(f.loadData()).toBeResolved();
                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ANALYSING);
                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_NEED_ACTION);

                    await expectAsync(f.check()).toBeResolvedTo(true);
                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ACTING);
                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ACTED_SUCCESS);

                    expect(getNotifyCallsForFile(f).length).toBe(i);
                    resetOptionsForUnitTesting();
                });

                it('with legacy workflow', async function () {
                    options.dryRun = true;
                    let i = 0;
                    t = Task.TaskSuccessFactory();

                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_CREATED);
                    await expectAsync(f.loadData()).toBeResolved();
                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_ANALYSING);
                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(STATUS_NEED_ACTION);

                    await expectAsync(f.check()).toBeResolvedTo(true);

                    expect(getNotifyCallsForFile(f).length).toBe(i);
                    resetOptionsForUnitTesting();
                });
            });
        });
    });
});
