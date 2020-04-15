
const { basename } = require('path');

const FileUnsupported = require('../../file-organizer/main/file-unsupported.js');
const File = require('../../file-organizer/main/file.js');
const {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE
} = require('../../file-organizer/constants.js');

const { getStatusHistoryForFile } = require('./helpers.js');

describe(basename(__filename), () => {
    beforeEach(() => {
        spyOn(File.prototype, 'notify').and.callThrough();
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
            expect(getStatusHistoryForFile(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);
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
