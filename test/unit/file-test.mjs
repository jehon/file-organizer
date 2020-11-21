
import { t } from '../test-helper.js';

import File from '../../src/main/file-types/file.js';

import Task, { _TaskSuccessFactory } from '../../src/main/task.js';
import Info from '../../src/main/info.js';
import { listenForItemNotify, getStatusChangesForItem } from './help-functions.mjs';

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
            // We need real files here, since "buildFile" will check for folder existence

            expect((new File('test/data/canon.JPG')).parent.path).toBe('test/data');
            expect((new File('test/test.txt')).parent.path).toBe('test');
            expect((new File('test/test.txt')).parent.parent.path).toBe(process.cwd());
            expect((new File('test.txt')).parent.path).toBe(process.cwd());
        });

        it('should be constructed with a parent', () => {
            expect((new File('test/brol/a.txt', new File('/machin'))).parent.path).toBe('/machin');
        });

        it('should allow creating info', () => {
            const f = new File('test');
            expect(f.analysisAddInfo(Info, 'value').parent.id).toBe(f.id);
        });
    });

    describe('state machine', () => {
        let f;

        beforeEach(() => {
            // spyOn(messenger, 'notify').and.returnValue(true);
            // spyOn(Item.prototype, 'notify').and.callThrough();
            listenForItemNotify();

            f = new DemoFile('file-test');
        });

        it('should analyse a file already ok', async function () {
            f.withAnalyse(() => true);

            expect(getStatusChangesForItem(f)[0]).toBe(STATUS_CREATED);

            await expectAsync(f.runAnalyse())
                .toBeResolvedTo(true);

            expect(getStatusChangesForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);

            await expectAsync(f.act()).toBeResolved();
        });

        it('should analyse a file impossible', async function () {
            f.withAnalyse(() => { throw 'impossible'; });

            await expectAsync(f.runAnalyse())
                .toBeRejectedWith('impossible');

            expect(getStatusChangesForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);

            await expectAsync(f.act()).toBeRejected();
        });

        describe('with tasks', function () {
            let t;

            beforeEach(() => {
                f.withAnalyse(() => f.analysisAddFixAct(t));
            });

            it('with successfull task', async function () {
                let i = 0;
                t = new Task('test task', () => true);

                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_CREATED);
                await expectAsync(f.runAnalyse()).toBeResolved();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ANALYSING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.act()).toBeResolved();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTED_SUCCESS);

                expect(getStatusChangesForItem(f).length).toBe(i);
            });

            it('with failing task', async function () {
                let i = 0;
                t = new Task('test task', () => { throw 'impossible'; });

                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_CREATED);
                await expectAsync(f.runAnalyse()).toBeResolved();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ANALYSING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.act()).toBeRejectedWith('impossible');
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTED_FAILURE);

                expect(getStatusChangesForItem(f).length).toBe(i);
            });


            describe('with legacy workflow', function () {

                it('with legacy workflow', async function () {
                    options.dryRun = false;
                    let i = 0;
                    t = _TaskSuccessFactory();

                    expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_CREATED);
                    await expectAsync(f.loadData()).toBeResolved();
                    expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ANALYSING);
                    expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_NEED_ACTION);

                    await expectAsync(f.check()).toBeResolved();
                    expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTING);
                    expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTED_SUCCESS);

                    expect(getStatusChangesForItem(f).length).toBe(i);
                    resetOptionsForUnitTesting();
                });

                it('with legacy workflow', async function () {
                    options.dryRun = true;
                    let i = 0;
                    t = _TaskSuccessFactory();

                    expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_CREATED);
                    await expectAsync(f.loadData()).toBeResolved();
                    expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ANALYSING);
                    expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_NEED_ACTION);

                    await expectAsync(f.check()).toBeResolved();

                    expect(getStatusChangesForItem(f).length).toBe(i);
                    resetOptionsForUnitTesting();
                });
            });
        });
    });
});
