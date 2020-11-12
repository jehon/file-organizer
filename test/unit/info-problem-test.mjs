
import { t } from '../test-helper.js';

import InfoProblem from '../../file-organizer/main/info-problem.js';
import Item from '../../file-organizer/main/item.js';

import {
    TYPE_INFO,
    STATUS_CREATED,
    STATUS_FAILURE
} from '../../src/common/constants.js';

import { getStatusHistoryForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should have a correct state machine', async function () {
        const i = new InfoProblem('test');

        expect(i.type).toBe(TYPE_INFO);

        expect(getStatusHistoryForItem(i)).toEqual([STATUS_CREATED, STATUS_FAILURE]);
    });
});
