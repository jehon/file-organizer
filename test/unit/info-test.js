
const { basename } = require('path');

const Info = require('../../file-organizer/main/info.js');
const Item = require('../../file-organizer/main/item.js');

const {
    TYPE_INFO,
    STATUS_CREATED
} = require('../../file-organizer/constants.js');

const { getStatusHistoryForItem } = require('./helpers.js');

describe(basename(__filename), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should have a correct state machine', async function () {
        const i = new Info('test');

        expect(i.type).toBe(TYPE_INFO);

        expect(getStatusHistoryForItem(i)).toEqual([STATUS_CREATED]);
    });
});
