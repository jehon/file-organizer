
import { t } from './help-functions.mjs';

import FileManual from '../../src/main/file-types/file-manual.js';
import Item from '../../src/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE
} from '../../src/common/constants.js';

import { getStatusChangesForItem } from './help-functions.mjs';
import { FOError } from '../../src/main/file-types/file.js';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should be always good', async function () {
        const f = new FileManual('failure.txt');
        await f.runAnalyse();
        expect(() => f.runConsistencyCheck()).toThrowError(FOError);
        await expectAsync(f.runActing()).toBeRejectedWithError(FOError);

        expect(getStatusChangesForItem(f)).toEqual([
            STATUS_CREATED,
            STATUS_ANALYSING,
            STATUS_FAILURE]);
    });
});
