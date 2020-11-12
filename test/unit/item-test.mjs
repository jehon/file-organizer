
import { t } from '../test-helper.js';

import Item from '../../file-organizer/main/item.js';
import {
    STATUS_CREATED
} from '../../src/common/constants.js';

import { getStatusHistoryForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    describe('with properties', function () {
        it('should handle properties', () => {
            const i = new Item('my title');
            expect(i.title).toBe('my title');
            expect(i.type).toBe('Item');
            expect(i.subType).toBe('Item');
            const i2 = new Item('2');
            i.withParent(i2);
            expect(i.parent.id).toBe(i2.id);


            const t2 = new Item();
            expect(t2.title).toBe('');
        });

        it('should be built with parent', function () {
            const i2 = new Item('2');
            const i = new Item('2', i2);
            expect(i.parent.id).toBe(i2.id);
        });

    });

    describe('on notify', function () {
        beforeEach(() => {
            spyOn(Item.prototype, 'notify').and.callThrough();
        });

        it('should be always good', async function () {
            const t = new Item('my title');

            expect(getStatusHistoryForItem(t)).toEqual([STATUS_CREATED]);
        });
    });
});
