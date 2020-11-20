
import { t } from '../test-helper.js';
import {
    buildFile, registerRegExp, glob2regExp,
    FallBackRegExp, _backup, _regExpMapForFolders, _regExpMapForFiles
} from '../../src/main/register-file-types.js';
import File from '../../src/main/file-types/file.js';
import '../../src/main/file-types/file-folder.js';

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
        _regExpMapForFiles.clear();
        _regExpMapForFolders.clear();


        // We need this one in the File.js to build up the parent
        // registerRegExp(FallBackRegExp, A, { forFiles: true, forFolders: true });
        // TODO(file-folder): remove this horrible hack
        registerRegExp('//', A, { forFiles: true, forFolders: true });

    });

    it('should register and find it back', async () => {
        registerRegExp(glob2regExp('test.a'), A, { forFiles: true });
        expect(await buildFile('test.a')).toEqual(jasmine.any(A));
    });

    it('should register an array and find it back', async () => {
        registerRegExp([
            glob2regExp('test.a'),
            glob2regExp('test.b')
        ], A, { forFiles: true });
        expect(await buildFile('test.a')).toEqual(jasmine.any(A));
        expect(await buildFile('test.b')).toEqual(jasmine.any(A));

        expect(await buildFile('TEST.A')).toEqual(jasmine.any(A));
    });

    it('should handle fallback and find it back', async () => {
        registerRegExp(glob2regExp('test.a'), A, { forFiles: true });
        registerRegExp(FallBackRegExp, B, { forFiles: true });
        expect(await buildFile('test.a')).toEqual(jasmine.any(A));
        expect(await buildFile('test.b')).toEqual(jasmine.any(B));
    });

    it('should handle globs', async () => {
        registerRegExp(glob2regExp('a.*'), A, { forFiles: true });
        registerRegExp(glob2regExp('b.*'), B, { forFiles: true });
        expect(await buildFile('a.test')).toEqual(jasmine.any(A));
        expect(await buildFile('b.test')).toEqual(jasmine.any(B));

        await expectAsync(buildFile('aa.test')).toBeRejected();
    });

    it('should handle . as a litteral', async () => {
        registerRegExp(glob2regExp('a.test'), A, { forFiles: true });
        registerRegExp(glob2regExp('a_test'), B, { forFiles: true });
        expect(await buildFile('a.test')).toEqual(jasmine.any(A));
        expect(await buildFile('a_test')).toEqual(jasmine.any(B));
    });

    it('should handle globs by size', async () => {
        registerRegExp(glob2regExp('test.*'), A, { forFiles: true });
        registerRegExp(glob2regExp('test.truc.*'), B, { forFiles: true });
        expect(await buildFile('test.truc.bac')).toEqual(jasmine.any(B));
        expect(await buildFile('test.somethingelse')).toEqual(jasmine.any(A));
    });
});
