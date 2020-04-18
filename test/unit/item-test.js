
const { basename } = require('path');

const Item = require('../../file-organizer/main/item.js');
const {
    STATUS_CREATED
} = require('../../file-organizer/constants.js');

const { getStatusHistoryForItem } = require('./helpers.js');

describe(basename(__filename), () => {
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
