
import { t } from '../test-helper.js';

import Info from '../../file-organizer/main/info.js';
import Item from '../../file-organizer/main/item.js';

import {
    TYPE_INFO,
    STATUS_CREATED
} from '../../src/common/constants.js';

import { getStatusHistoryForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should have a correct state machine', async function () {
        const i = new Info('test');

        expect(i.type).toBe(TYPE_INFO);

        expect(getStatusHistoryForItem(i)).toEqual([STATUS_CREATED]);
    });
});
