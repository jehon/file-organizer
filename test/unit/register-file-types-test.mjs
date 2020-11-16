
import { t } from '../test-helper.js';
import { buildFile, registerFallback, registerFolder, registerGlob, _reset, _backup } from '../../src/main/register-file-types.js';
import File from '../../file-organizer/main/file.js';

class A extends File { }
class B extends File { }

describe(t(import.meta), function () {
    let _restore;

    beforeAll(() => {
        _restore = _backup();
    });

    afterAll(() => {
        _restore();
    });

    beforeEach(() => {
        _reset();
    });

    it('should register and find it back', async () => {
        registerGlob('test.a', A);
        expect(await buildFile('test.a')).toEqual(jasmine.any(A));
    });

    it('should register an array and find it back', async () => {
        registerGlob(['test.a', 'test.b'], A);
        expect(await buildFile('test.a')).toEqual(jasmine.any(A));
        expect(await buildFile('test.b')).toEqual(jasmine.any(A));

        expect(await buildFile('TEST.A')).toEqual(jasmine.any(A));
    });

    xit('should not allow duplicated registering', async () => {
        registerGlob('test.a', A);
        expect(() => registerFolder('test.a')).toThrow();
    });

    it('should register folder handler and find it back', async () => {
        registerGlob('test.a', A);
        registerFolder(B);
        expect(await buildFile('./')).toEqual(jasmine.any(B));

        expect(() => registerFolder(A)).toThrow();
    });

    it('should handle fallback and find it back', async () => {
        registerGlob('test.a', A);
        registerFallback(B);
        expect(await buildFile('test.a')).toEqual(jasmine.any(A));
        expect(await buildFile('test.b')).toEqual(jasmine.any(B));
    });

    it('should handle globs', async () => {
        registerGlob('a.*', A);
        registerGlob('b.*', B);
        expect(await buildFile('a.test')).toEqual(jasmine.any(A));
        expect(await buildFile('b.test')).toEqual(jasmine.any(B));

        await expectAsync(buildFile('aa.test')).toBeRejected();
    });

    it('should handle . as a litteral', async () => {
        registerGlob('a.test', A);
        registerGlob('a_test', B);
        expect(await buildFile('a.test')).toEqual(jasmine.any(A));
        expect(await buildFile('a_test')).toEqual(jasmine.any(B));
    });

    it('should handle globs by size', async () => {
        registerGlob('test.*', A);
        registerGlob('test.truc.*', B);
        expect(await buildFile('test.truc.bac')).toEqual(jasmine.any(B));
        expect(await buildFile('test.somethingelse')).toEqual(jasmine.any(A));
    });
});
