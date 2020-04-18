
const { basename } = require('path');

const FileConvertSource = require('../../file-organizer/main/file-convert-source.js');
const Item = require('../../file-organizer/main/item.js');
const {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE
} = require('../../file-organizer/constants.js');

const { getStatusHistoryForItem } = require('./helpers.js');

describe(basename(__filename), () => {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
        spyOn(console, 'info').and.returnValue();
    });

    it('should be always good', async function () {
        const f = new FileConvertSource('failure.txt');
        await expectAsync(f.runAnalyse()).toBeResolved();
        await expectAsync(f.act()).toBeResolved();

        expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);
    });
});
