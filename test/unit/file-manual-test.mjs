
import { t } from '../test-helper.js';

import FileManual from '../../src/main/file-types/file-manual.js';
import Item from '../../src/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE
} from '../../file-organizer/constants.js';

import { getStatusHistoryForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should be always good', async function () {
        const f = new FileManual('failure.txt');
        await expectAsync(f.runAnalyse()).toBeResolved();
        await expectAsync(f.act()).toBeResolved();

        expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);
    });
});
