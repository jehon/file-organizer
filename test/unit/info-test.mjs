
import { t } from '../test-helper.js';

import Info from '../../src/main/info.js';
import Item from '../../src/main/item.js';

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
        const i = new Info('test', 'truc', null);

        expect(i.type).toBe(TYPE_INFO);

        expect(getStatusHistoryForItem(i)).toEqual([STATUS_CREATED, STATUS_CREATED]);
    });
});
