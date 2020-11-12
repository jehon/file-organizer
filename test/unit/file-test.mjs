
import { t } from '../test-helper.js';

import File from '../../file-organizer/main/file.js';
import Item from '../../file-organizer/main/item.js';

import Task from '../../file-organizer/main/task.js';
import Info from '../../file-organizer/main/info.js';
import messenger from '../../file-organizer/main/messenger.js';

import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS,
    STATUS_FAILURE,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS,
    STATUS_ACTED_FAILURE
} from '../../src/common/constants.js';

import { getNotifyCallsForFile, getStatusHistoryForItem } from './help-functions.mjs';
import options from '../../file-organizer/options.js';
import { resetOptionsForUnitTesting } from './run-helper.mjs';

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

describe(t(import.meta), function () {
    describe('attributes', () => {
        it('should parse extension', () => {
            expect((new File('a.txt')).extension).toBe('.txt');
            expect((new File('a')).extension).toBe('');
        });

        it('should parse filename', () => {
            expect((new File('a.txt')).filename).toBe('a');
            expect((new File('a')).filename).toBe('a');
            expect((new File('test/a.txt')).filename).toBe('a');
            expect((new File('test/a')).filename).toBe('a');
        });

        it('should give a parent', () => {
            expect((new File('test/brol/a.txt')).parent.path).toBe('test/brol');
            expect((new File('test/a.txt')).parent.path).toBe('test');
            expect((new File('test/a.txt')).parent.parent.path).toBe(process.cwd());
            expect((new File('a.txt')).parent.path).toBe(process.cwd());
        });

        it('should be constructed with a parent', () => {
            expect((new File('test/brol/a.txt', new File('/machin'))).parent.path).toBe('/machin');
        });

        it('should allow creating info', () => {
            const f = new File('test');
            expect(f.createInfo(Info, []).parent.id).toBe(f.id);
        });
    });

    describe('state machine', () => {
        let f;

        beforeEach(() => {
            spyOn(messenger, 'notify').and.returnValue(true);
            spyOn(Item.prototype, 'notify').and.callThrough();

            f = new DemoFile('file-test');
        });

        it('should analyse a file already ok', async function () {
            f.withAnalyse(() => true);

            expect(getNotifyCallsForFile(f, 0)[0]).toBe(STATUS_CREATED);

            await expectAsync(f.runAnalyse())
                .toBeResolvedTo(true);

            expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);

            await expectAsync(f.act()).toBeResolvedTo(true);
        });

        it('should analyse a file impossible', async function () {
            f.withAnalyse(() => { throw 'impossible'; });

            await expectAsync(f.runAnalyse())
                .toBeRejectedWith('impossible');

            expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);

            await expectAsync(f.act()).toBeResolvedTo(false);
        });

        it('should analyse a file by tasks', async function () {
            f.withAnalyse(() => { f.createAndRun(Task, 'test', () => true); });

            await expectAsync(f.runAnalyse())
                .toBeResolved();

            expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);

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
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(undefined);
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
                expect(getNotifyCallsForFile(f, i++)[0]).toBe(undefined);
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
                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(undefined);
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
                    expect(getNotifyCallsForFile(f, i++)[0]).toBe(undefined);
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
