
import { t } from '../test-helper.js';

import FileDelete from '../../file-organizer/main/file-delete.js';
import Item from '../../file-organizer/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS
} from '../../src/common/constants.js';

import { createFileFrom, fileExists } from './help-functions.mjs';
import { getStatusHistoryForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should delete a file', async function () {
        const fo = await createFileFrom('jh-patch-file-patch.txt');
        const f = new FileDelete(fo.path);
        await f.runAnalyse();
        await f.act();

        expect(await fileExists(f.path)).toBeFalsy();

        expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_NEED_ACTION, STATUS_ACTING, STATUS_ACTED_SUCCESS]);
    });
});
