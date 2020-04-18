
const { basename } = require('path');

const FileHidden = require('../../file-organizer/main/file-hidden.js');
const Item = require('../../file-organizer/main/item.js');
const {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_SUCCESS
} = require('../../file-organizer/constants.js');

const { getStatusHistoryForItem } = require('./helpers.js');

describe(basename(__filename), () => {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should be always good', async function () {
        const f = new FileHidden('.');
        await expectAsync(f.runAnalyse()).toBeResolved();
        await expectAsync(f.act()).toBeResolved();

        expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_SUCCESS]);
    });
});
