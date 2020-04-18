
const { basename } = require('path');

const Item = require('../../file-organizer/main/item.js');
const {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE
} = require('../../file-organizer/constants.js');

const { getStatusHistoryForItem } = require('./helpers.js');

describe(basename(__filename), () => {
    describe('with properties', function () {
        it('should handle properties', () => {
            const t = new Item('my title');
            expect(t.title).toBe('my title');
            expect(t.type).toBe('Item');
            expect(t.subType).toBe('Item');
            const c = new Item("2")
            t.withParent(c)
            expect(t.parent.id).toBe(c.id);

            const t2 = new Item();
            expect(t2.title).toBe('');
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
