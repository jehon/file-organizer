
import { t } from '../test-helper.js';
import path from 'path';

import File from '../../src/main/file-types/file.js';
import options from '../../file-organizer/options.js';
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
import { fileRename } from '../../src/main/tasks-fs.js';

import {
    listenForItemNotify,
    getStatusChangesForItem,
    createFileFrom,
    fileExists
} from './help-functions.mjs';

import { resetOptionsForUnitTesting, r } from './run-helper.mjs';

class DemoFile extends File {
    fnAct = () => { }
    fnAnalyse = () => { }

    withAnalyse(fn) {
        this.fnAnalyse = fn;
        return this;
    }

    async analyse() {
        return super.analyse()
            .then(this.fnAnalyse);
    }

    withAct(fn) {
        this.fnAct = () => fn();
    }

    async act() {
        return Promise.resolve()
            .then(() => this.fnAct ? this.fnAct() : true)
            .then(() => super.act());

    }
}

describe(t(import.meta), function () {
    describe('attributes', () => {
        it('should parse extension', () => {
            expect((new File('a.txt')).get(File.I_EXTENSION).initial).toBe('.txt');
            expect((new File('a')).get(File.I_EXTENSION).initial).toBe('');
        });

        it('should parse filename', () => {
            expect((new File('a.txt')).get(File.I_FILENAME).initial).toBe('a');
            expect((new File('a')).get(File.I_FILENAME).initial).toBe('a');
            expect((new File('test/a.txt')).get(File.I_FILENAME).initial).toBe('a');
            expect((new File('test/a')).get(File.I_FILENAME).initial).toBe('a');
        });

        it('should give a parent', () => {
            // We need real files here, since "buildFile" will check for folder existence

            expect((new File('test/data/canon.JPG')).parent.currentFilePath).toBe(path.join(process.cwd(), 'test/data'));
            expect((new File('test/test.txt')).parent.currentFilePath).toBe(path.join(process.cwd(), 'test'));
            expect((new File('test/test.txt').parent.parent.currentFilePath)).toBe(process.cwd());
            expect((new File('test.txt').parent.currentFilePath)).toBe(process.cwd());
        });

        it('should be constructed with a parent', () => {
            expect((new File('test/brol/a.txt', new File('/machin'))).parent.currentFilePath).toBe('/machin');
        });

        it('should always have the current path', () => {
            const f = new File('test/brol/a.txt');

            expect(r(f.currentFilePath)).toBe('test/brol/a.txt');

            f.get(File.I_FILENAME).expect('b').fix();
            expect(r(f.currentFilePath)).toBe('test/brol/b.txt');

            f.get(File.I_EXTENSION).expect('.jpg').fix();
            expect(r(f.currentFilePath)).toBe('test/brol/b.jpg');

            f.parent.get(File.I_FILENAME).expect('machin').fix();
            expect(r(f.currentFilePath)).toBe('test/machin/b.jpg');
        });
    });

    describe('state machine', () => {
        let f;

        beforeEach(() => {
            listenForItemNotify();

            f = new DemoFile('file-test');
        });

        it('should analyse a file already ok', async function () {
            f.withAnalyse(() => true);

            expect(getStatusChangesForItem(f)[0]).toBe(STATUS_CREATED);

            await expectAsync(f.runAnalyse())
                .toBeResolved();

            expect(getStatusChangesForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);

            await expectAsync(f.runActing()).toBeResolved();
        });

        it('should analyse a file impossible', async function () {
            f.withAnalyse(() => { throw 'impossible'; });

            await expectAsync(f.runAnalyse())
                .toBeRejectedWith('impossible');

            expect(getStatusChangesForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);

            await expectAsync(f.runActing()).toBeRejected();
        });

        describe('with act', function () {
            beforeEach(() => {
                f.withAnalyse(() => { f.notify(STATUS_NEED_ACTION); });
            });

            it('with successfull task', async function () {
                let i = 0;
                f.withAct(() => true);

                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_CREATED);
                await expectAsync(f.runAnalyse()).toBeResolved();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ANALYSING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.runActing()).toBeResolved();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTED_SUCCESS);

                expect(getStatusChangesForItem(f).length).toBe(i);
            });

            it('with failing task', async function () {
                let i = 0;
                f.withAct(() => { throw 'impossible'; });

                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_CREATED);
                await expectAsync(f.runAnalyse()).toBeResolved();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ANALYSING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.runActing()).toBeRejectedWith('impossible');
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTED_FAILURE);

                expect(getStatusChangesForItem(f).length).toBe(i);
            });


            describe('with legacy workflow', function () {
                it('with legacy workflow', async function () {
                    options.dryRun = false;
                    let i = 0;
                    f.withAct(() => true);

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
                    f.withAct(() => true);

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

    describe('early fixes', function () {
        it('should lowercase extensions', async function () {
            options.dryRun = true;

            const f1 = await createFileFrom('jh-patch-file-patch.txt');

            f1.get(File.I_EXTENSION).expect('.TX2');
            await fileRename(f1);

            await expectAsync(fileExists(f1.currentFilePath)).toBeResolvedTo(true);
            expect(f1.currentFilePath.endsWith('.TX2')).toBeTrue();

            const f2 = new File(f1.currentFilePath);
            await f2.runAnalyse();
            expect(f2.get(File.I_EXTENSION).expected).toBe('.tx2');
            await f2.runActing();

            expect(f2.currentFilePath.endsWith('.tx2')).toBeTrue();
            await expectAsync(fileExists(f2.currentFilePath)).toBeResolvedTo(true);

        });
    });
});
