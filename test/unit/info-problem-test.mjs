
import { t } from '../test-helper.js';

import InfoProblem from '../../src/main/info-problem.js';
import Item from '../../src/main/item.js';

import {
    TYPE_INFO,
    STATUS_CREATED,
    STATUS_FAILURE,
    STATUS_NEED_ACTION
} from '../../src/common/constants.js';

import { getStatusHistoryForItem } from './help-functions.mjs';
import { STATUS_ANALYSING } from '../../file-organizer/constants.js';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should have a correct state machine', async function () {
        const i = new InfoProblem('test', 'val_initial', 'val_expected');

        expect(i.type).toBe(TYPE_INFO);

        expect(getStatusHistoryForItem(i)).toEqual([STATUS_CREATED, STATUS_CREATED, STATUS_ANALYSING, STATUS_NEED_ACTION, STATUS_FAILURE]);
    });
});
