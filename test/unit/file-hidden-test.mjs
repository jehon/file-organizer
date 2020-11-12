
import { t } from '../test-helper.js';

import FileHidden from '../../file-organizer/main/file-hidden.js';
import Item from '../../file-organizer/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS
} from '../../src/common/constants.js';

import { getStatusHistoryForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should be always good', async function () {
        const f = new FileHidden('.');
        await expectAsync(f.runAnalyse()).toBeResolved();
        await expectAsync(f.act()).toBeResolved();

        expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);
    });
});
