
const { basename } = require('path');

const FileUnsupported = require('../../file-organizer/main/file-unsupported.js');
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
        FileUnsupported._map.clear();

        console.info.calls.reset();
        expect(() => FileUnsupported.dumpDiscoveredExtension()).not.toThrow();
        expect(console.info).not.toHaveBeenCalled();

        {
            const f = new FileUnsupported('failure.txt');
            await expectAsync(f.runAnalyse()).toBeResolved();
            await expectAsync(f.act()).toBeResolved();
            expect(getStatusHistoryForItem(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);
        }
        {
            const f = new FileUnsupported('failure2.txt');
            await expectAsync(f.runAnalyse()).toBeResolved();
            await expectAsync(f.act()).toBeResolved();
        }

        console.info.calls.reset();
        expect(() => FileUnsupported.dumpDiscoveredExtension()).not.toThrow();
        expect(console.info).toHaveBeenCalled();

        expect(FileUnsupported._map.size).toBe(1);
        expect(FileUnsupported._map.get('.txt')).toBe(2);
    });
});
