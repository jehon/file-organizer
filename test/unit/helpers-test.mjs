
import { t } from '../test-helper.js';

import fs from 'fs';

import { dataPath, tempPath, createFileFrom } from './help-functions.mjs';
import File from '../../src/main/file-types/file.js';

describe(t(import.meta), function () {
    it('should have a data path', function () {
        expect(fs.existsSync(dataPath())).toBeTruthy();
        expect(fs.existsSync(dataPath('..', 'data'))).toBeTruthy();
    });

    it('should create temp generic file', async () => {
        const filename = await createFileFrom('20150306_153340 Cable internet dans la rue.jpg');
        const f = new File(filename);
        expect(f.get(File.I_FILENAME).initial).toBe('20150306_153340 Cable internet dans la rue');
        expect(f.parent.currentFilePath).toBe(tempPath());
        fs.unlinkSync(f.currentFilePath);
    });
});
