
import { t } from './help-functions.mjs';

import FileHidden from '../../src/main/file-types/file-hidden.js';
import Item from '../../src/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS
} from '../../src/common/constants.js';

import { getStatusChangesForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should be always good', async function () {
        const f = new FileHidden('.');
        await expectAsync(f.runAnalyse()).toBeResolved();
        expect(() => f.runConsistencyCheck()).not.toThrow();
        await expectAsync(f.runActing()).toBeResolved();

        expect(getStatusChangesForItem(f)).toEqual([
            STATUS_CREATED,
            STATUS_ANALYSING,
            STATUS_SUCCESS
        ]);
    });
});
