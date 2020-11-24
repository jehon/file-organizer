
import { t } from '../test-helper.js';
import path from 'path';

import { tempPath, createFileGeneric, dataPath, fileExists } from './help-functions.mjs';
import fileUtils from '../../file-organizer/file-utils.js';
import FileGeneric from '../../file-organizer/file-generic.js';

import { tsFromString } from '../../file-organizer/timestamp.js';

describe(t(import.meta), function () {
    describe('attributes', () => {
        it('should get attributes', async () => {
            const fpath = path.join(dataPath(), 'test.txt');
            let new1 = new FileGeneric(fpath);

            expect(new1.getFilename()).toBe('test');
            expect(new1.getExtension()).toBe('.txt');
            expect(new1.getPath()).toBe(fpath);
        });

        it('should get the parent', function () {
            expect((new FileGeneric(path.join(dataPath(), 'test.txt')))
                .parent.getPath())
                .toBe(dataPath());
            expect((new FileGeneric('.'))
                .parent.getPath())
                .toBe(path.dirname(process.cwd()));
            expect((new FileGeneric('/')).parent).toBeNull();
        });

    });

    describe('crud', () => {
        it('should changeFilename', async () => {
            const new1 = await createFileGeneric('jh-patch-file-patch.txt');

            await new1.changeFilename('file-generic-test-1');
            expect(new1.getFilename()).toBe('file-generic-test-1');
            expect(new1.getExtension()).toBe('.txt');
            expect(new1.parent.getPath()).toBe(tempPath());

            await fileUtils.fileDelete(new1.getPath());
        });

        it('should remove the file', async function () {
            const new1 = await createFileGeneric('jh-patch-file-patch.txt');

            let filename = new1.getPath();

            expect(await fileExists(filename)).toBeTruthy();
            await new1.remove();
            expect(await fileExists(filename)).toBeFalsy();
        });
    });

    describe('check', () => {
        it('should fix extensions', async () => {
            spyOn(fileUtils, 'fileRename');

            const new1 = new FileGeneric('canon.JPG');
            await new1.check();
            expect(Array.from(new1.messages.keys())).toContain('FILE_EXT_UPPERCASE');
            expect(fileUtils.fileRename).toHaveBeenCalledTimes(1);
            expect(new1.getFilename()).toBe('canon');
            expect(new1.getExtension()).toBe('.jpg');
        });
    });
});
