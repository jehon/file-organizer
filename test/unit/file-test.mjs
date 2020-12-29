
import { t } from './help-functions.mjs';

import File, { FOError } from '../../src/main/file-types/file.js';
import options from '../../src/common/options.js';

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
import { fileRename, fileExistsPhysically } from '../../src/main/fs-utils.js';

import {
    listenForItemNotify,
    getStatusChangesForItem,
    createFileFrom,
    tempPath,
    dataPath,
    fromCWD
} from './help-functions.mjs';

class DemoFile extends File {
    fnLoadData = () => { }
    fnPrepare = () => { }
    fnFix = () => { }

    withLoadData(fn) {
        this.fnLoadData = fn;
        return this;
    }

    async loadData() {
        await super.loadData();
        await this.fnLoadData();
        return this;
    }

    withPrepare(fn) {
        this.fnPrepare = fn;
        return this;
    }

    prepare() {
        super.prepare();
        this.fnPrepare();
    }

    withFix(fn) {
        this.fnFix = () => fn();
    }

    async fix() {
        // await super.act();
        await this.fnFix();
        return this;
    }
}

describe(t(import.meta), function () {
    describe('with attributes', () => {
        describe('initial', () => {
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
                // await f.loadData();
                expect(f.get(File.I_F_QUALIF).initial).toBe('20150306_153340');
                expect(f.get(File.I_F_TITLE).initial).toBe('Cable internet dans la rue');
                expect(f.get(File.I_F_TIME).initial).toBe('2015-03-06 15-33-40');
            });

            it('parse invalid filename', async () => {
                const f = new File('1913-14-75 Cable internet dans la rue.jpg');
                expect(f.get(File.I_F_QUALIF).initial).toBe('');
                expect(f.get(File.I_F_TITLE).initial).toBe('1913-14-75 Cable internet dans la rue');
                expect(f.get(File.I_F_TIME).initial).toBe('');
            });

            it('should give a parent', () => {
                // We need real files here, since "buildFile" will check for folder existence

                expect((new File('test/data/canon.JPG')).parent.currentFilePath).toBe(fromCWD('test/data'));
                expect((new File('test/test.txt')).parent.currentFilePath).toBe(fromCWD('test'));
                expect((new File('test/test.txt').parent.parent.currentFilePath)).toBe(fromCWD());
                expect((new File('test.txt').parent.currentFilePath)).toBe(fromCWD());
            });

            it('should be constructed with a parent', () => {
                expect(new File('test/brol/a2.txt').parent.currentFilePath).toBe(fromCWD('test/brol'));
            });

            it('should always have the current path', () => {
                const f = new File('test_rename/brol/a.txt');
                expect(f.currentFilePath).toBe(fromCWD('test_rename/brol/a.txt'));

                f.get(File.I_FILENAME).expect('b').fix();
                expect(f.currentFilePath).toBe(fromCWD('test_rename/brol/b.txt'));

                f.get(File.I_EXTENSION).expect('.jpg').fix();
                expect(f.currentFilePath).toBe(fromCWD('test_rename/brol/b.jpg'));

                f.parent.get(File.I_FILENAME).expect('machin').fix();
                expect(f.currentFilePath).toBe(fromCWD('test_rename/machin/b.jpg'));
            });

        });

        describe('expected', () => {
            it('should parse filename qualif', async () => {
                const f = new File('2015-05-26 11-37-24 vie de famille [VID_20120526_113724]');
                await f.loadData();
                expect(f.get(File.I_F_TIME).expected.substr(0, 4)).toBe('2012');
                expect(f.get(File.I_F_TITLE).expected).toBe('vie de famille');
            });

            it('should parse remove duplicate title/qualif', async () => {
                const f = new File('vie de famille [vie de famille]');
                await f.loadData();
                expect(f.get(File.I_F_QUALIF).expected).toBe('');
                expect(f.get(File.I_F_TITLE).expected).toBe('vie de famille');
            });

            it('should calculate a canonicalFilename', async () => {
                expect((await new File('2018-02-04').loadData()).getCanonicalFilename()).toBe('2018-02-04');
                expect((await new File('2018-02-04 13-17-50 canon').loadData()).getCanonicalFilename()).toBe('2018-02-04 13-17-50 canon');
                expect((await new File('2020-01-19 01-24-02 petitAppPhoto').loadData()).getCanonicalFilename()).toBe('2020-01-19 01-24-02 petitAppPhoto');
                expect((await new File('petitAppPhoto').loadData()).getCanonicalFilename()).toBe('petitAppPhoto');
            });
        });

        xit('should find an indexed filename', async function () {
            //         const filename = await createFileFrom('canon.JPG');
            //         const n1 = new File(filename);
            //         await n1.check();
            //         expect(await n1.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon');
            //         const n2 = new FileTimed(n1.getPath());

            //         await n1.changeFilename('2018-02-04 13-17-50 canon [test]');

            //         // Index when file already exists
            //         n2.calculatedTS.qualif = 'test';
            //         expect(await n2.getIndexedFilename()).toBe('2018-02-04 13-17-50 canon [1]');

            //         // Skip numerical 'qualif' which should be indexes
            //         n1.calculatedTS.qualif = '123';
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

        it('should load data a file already ok', async function () {
            f.withLoadData(() => true);

            expect(getStatusChangesForItem(f)[0]).toBe(STATUS_CREATED);

            await f.loadData();
            f.runPrepare();

            expect(getStatusChangesForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);

            await expectAsync(f.runFix()).toBeResolved();
        });

        it('should analyse a file impossible', async function () {
            f.withPrepare(() => { throw new FOError('impossible'); });

            await f.loadData();
            await expect(() => f.runPrepare()).toThrowError(FOError, 'impossible');

            expect(getStatusChangesForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);

            await expectAsync(f.runFix()).toBeRejectedWithError(FOError);
        });

        it('should checkConsistency', async function (done) {
            f.withPrepare(() => { f.addProblem('test'); });

            await f.loadData();
            await expect(() => f.runPrepare()).toThrowError(FOError);
            expect(getStatusChangesForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);
            done();
            // }
        });


        describe('with fix', function () {
            beforeEach(() => {
                f.withPrepare(() => f.get(File.I_FILENAME).expect('go to need action'));
                f.withFix(() => {
                    f.get(File.I_FILENAME).fix();
                    f.get(File.I_F_TITLE).fix();
                });
            });

            it('with successfull task', async function () {
                let i = 0;

                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_CREATED);
                await f.loadData();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ANALYSING);

                f.runPrepare();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_NEED_ACTION);

                await f.runFix();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTED_SUCCESS);

                expect(getStatusChangesForItem(f).length).toBe(i);
            });

            it('with failing task', async function () {
                let i = 0;
                f.withFix(() => { throw new FOError('impossible'); });

                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_CREATED);
                await f.loadData();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ANALYSING);

                await f.runPrepare();
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_NEED_ACTION);

                await expectAsync(f.runFix()).toBeRejectedWithError(FOError, 'impossible');
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTING);
                expect(getStatusChangesForItem(f)[i++]).toBe(STATUS_ACTED_FAILURE);

                expect(getStatusChangesForItem(f).length).toBe(i);
            });
        });
    });

    describe('early fixes', function () {
        it('should lowercase extensions', async function () {
            options.dryRun = true;

            const filename = await createFileFrom('jh-patch-file-patch.txt');
            const f1 = new File(filename);

            f1.get(File.I_EXTENSION).expect('.TX2');
            await fileRename(f1);

            await expectAsync(fileExistsPhysically(f1.currentFilePath)).toBeResolvedTo(true);
            expect(f1.currentFilePath.endsWith('.TX2')).toBeTrue();

            const f2 = new File(f1.currentFilePath);
            await f2.loadData();
            expect(f2.get(File.I_EXTENSION).expected).toBe('.tx2');

            f2.runPrepare();
            await f2.runFix();

            expect(f2.currentFilePath.endsWith('.tx2')).toBeTrue();
            await expectAsync(fileExistsPhysically(f2.currentFilePath)).toBeResolvedTo(true);
        });

        it('should manage filename', async () => {
            const filename = await createFileFrom('20150306_153340 Cable internet dans la rue.jpg');
            const f = new File(filename);
            await f.loadData();

            f.runPrepare();
            await f.runFix();
            expect(f.getCanonicalFilename()).toBe('2015-03-06 15-33-40 Cable internet dans la rue [20150306_153340]');
            expect(f.currentFilePath).toBe(tempPath('2015-03-06 15-33-40 Cable internet dans la rue [20150306_153340].jpg'));
        });
    });

    describe('with folders', function () {
        it('should pass on all files', async () => {
            const folder = new File(dataPath());
            let res = 0;
            try {
                await folder.loadData();
            } catch (e) {
                if (!(e instanceof FOError)) {
                    throw e;
                }
            }

            for (const f of folder.children) {
                expect(f).toEqual(jasmine.any(File));
                expect(f.parent.currentFilePath).toBe(dataPath());
                expect(f.get(File.I_FILENAME).initial).not.toBe('.');
                expect(f.get(File.I_FILENAME).initial).not.toBe('..');

                // Do we have ... (by 2^ bits)
                if (f.get(File.I_FILENAME).initial == 'jh-patch-file-patch') {
                    res += 2;
                }
            }
            expect(res).toBe(2);
            expect(folder.children.length).toBe(15);
        });
    });
});
