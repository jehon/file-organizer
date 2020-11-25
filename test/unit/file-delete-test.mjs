
import { t } from '../test-helper.js';

import FileDelete from '../../src/main/file-types/file-delete.js';
import Item from '../../src/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS
} from '../../src/common/constants.js';

import { createFileFrom, fileExists } from './help-functions.mjs';
import { getStatusChangesForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should delete a file', async function () {
        const fo = await createFileFrom('jh-patch-file-patch.txt');
        const f = new FileDelete(fo.currentFilePath);
        await f.runAnalyse();
        await f.runActing();

        expect(await fileExists(f.currentFilePath)).toBeFalsy();

        expect(getStatusChangesForItem(f)).toEqual([
            STATUS_CREATED,
            STATUS_ANALYSING,
            STATUS_NEED_ACTION,
            STATUS_ACTING,
            STATUS_ACTED_SUCCESS
        ]);
    });
});
