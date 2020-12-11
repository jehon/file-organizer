
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

        it('parse filename', async () => {
            const f = new File('20150306_153340 Cable internet dans la rue.jpg');
            await f.runAnalyse();
            expect(f.get(File.I_FN_ORIGINAL).initial).toBe('20150306_153340');
            expect(f.get(File.I_FN_TITLE).initial).toBe('Cable internet dans la rue');
            expect(f.get(File.I_FN_TIME).initial.humanReadable()).toBe('2015-03-06 15-33-40');
        });

        it('parse invalid filename', async () => {
            const f = new File('1913-14-75 Cable internet dans la rue.jpg');
            try {
                await f.runAnalyse();
                throw 'Should have thrown';
            } catch (e) {
                expect(f.get(File.I_FN_ORIGINAL).initial).toBe('1913-14-75 Cable internet dans la rue');
                expect(f.get(File.I_FN_TITLE).initial).toBe('1913-14-75 Cable internet dans la rue');
                expect(f.get(File.I_FN_TIME).initial.humanReadable()).toBe('');
            }
        });

        xit('should parse filename original', async () => {
            const f = new File('2015-05-26 11-37-24 vie de famille [VID_20120526_113724]');
            await f.runAnalyse();
            expect(f.get(File.I_FN_TIME).expected.moment.year()).toBe(2012);
            expect(f.get(File.I_FN_TITLE).expected).toBe('vie de famille');
        });

        it('should calculate a canonicalFilename', async () => {
            expect((await new File('2018-02-04').runAnalyse()).getCanonicalFilename()).toBe('2018-02-04');
            expect((await new File('2018-02-04 13-17-50 canon').runAnalyse()).getCanonicalFilename()).toBe('2018-02-04 13-17-50 canon');
            expect((await new File('2020-01-19 01-24-02 petitAppPhoto').runAnalyse()).getCanonicalFilename()).toBe('2020-01-19 01-24-02 petitAppPhoto');
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

        xit('should find an indexed filename', async function () {
            //         const n1 = await createFileGeneric('canon.JPG');
            //         await n1.check();
            //         expect(await n1.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon');
            //         const n2 = new FileTimestamped(n1.getPath());

            //         await n1.changeFilename('2018-02-04 13-17-50 canon [test]');

            //         // Index when file already exists
            //         n2.calculatedTS.original = 'test';
            //         expect(await n2.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon [1]');

            //         // Skip numerical 'original' which should be indexes
            //         n1.calculatedTS.original = '123';
            //         expect(await n1.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon');

            //         await fileDelete(n1.getPath());
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
