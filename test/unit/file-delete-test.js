
const { basename } = require('path');

const FileDelete = require('../../file-organizer/main/file-delete.js');
const Item = require('../../file-organizer/main/item.js');
const {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_NEED_ACTION,
    STATUS_ACTING,
    STATUS_ACTED_SUCCESS
} = require('../../file-organizer/constants.js');

const { createFileFrom, fileExists } = require('./helpers.js');
const { getStatusHistoryForItem } = require('./helpers.js');

describe(basename(__filename), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
    });

    it('should delete a file', async function () {
        const fo = await createFileFrom('jh-patch-file-patch.txt');
        const f = new FileDelete(fo.path);
        await f.runAnalyse();
        await f.act();

        expect(await fileExists(f.path)).toBeFalsy();

        expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_NEED_ACTION, STATUS_ACTING, STATUS_ACTED_SUCCESS]);
    });
});
