
import { t } from '../test-helper.js';

import InfoProblem from '../../src/main/info-problem.js';
import Item from '../../src/main/item.js';

import {
    TYPE_INFO,
    STATUS_CREATED,
    STATUS_FAILURE,
    STATUS_NEED_ACTION
} from '../../src/common/constants.js';

import { getStatusChangesForItem } from './help-functions.mjs';
import { STATUS_ANALYSING } from '../../file-organizer/constants.js';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should have a correct state machine', async function () {
        const info = new InfoProblem('test', 'val_initial', 'val_expected');

        expect(info.type).toBe(TYPE_INFO);

        expect(getStatusChangesForItem(info)).toEqual([
            STATUS_CREATED,
            STATUS_ANALYSING,
            STATUS_NEED_ACTION,
            STATUS_FAILURE
        ]);
    });
});
