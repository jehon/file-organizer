
import {
    STATUS_ACTED_SUCCESS, STATUS_ACTING, STATUS_ANALYSING, STATUS_CREATED,

    STATUS_NEED_ACTION
} from '../../src/common/constants.js';
import FileDelete from '../../src/main/file-types/file-delete.js';
import { fileExists } from '../../src/main/fs-utils.js';
import Item from '../../src/main/item.js';
import { t } from '../test-helper.js';
import { createFileFrom, getStatusChangesForItem } from './help-functions.mjs';



describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should delete a file', async function () {
        const fpath = await createFileFrom('jh-patch-file-patch.txt');
        const f = new FileDelete(fpath);
        await f.runAnalyse();
        f.runConsistencyCheck();
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
