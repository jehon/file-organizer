
import { t } from './help-functions.mjs';

import FileHidden from '../../src/main/file-types/file-hidden.js';
import Item from '../../src/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS
} from '../../src/common/constants.js';

import { getStatusChangesForItem } from './help-functions.mjs';
import { _resetCache } from '../../src/main/register-file-types.js';

describe(t(import.meta), function () {
    beforeEach(() => _resetCache());

    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should be always good', async function () {
        const f = new FileHidden('.');
        await expectAsync(f.loadData()).toBeResolved();
        expect(() => f.runPrepare()).not.toThrow();
        await expectAsync(f.runFix()).toBeResolved();

        expect(getStatusChangesForItem(f)).toEqual([
            STATUS_CREATED,
            STATUS_ANALYSING,
            STATUS_SUCCESS
        ]);
    });
});
