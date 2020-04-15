
const { basename } = require('path');

const FileConvertSource = require('../../file-organizer/main/file-convert-source.js');
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
    });

    it('should be always good', async function () {
        const f = new FileConvertSource('failure.txt');
        await expectAsync(f.runAnalyse()).toBeResolved();
        await expectAsync(f.act()).toBeResolved();

        expect(getStatusHistoryForFile(f)).toEqual([STATUS_CREATED, STATUS_ANALYSING, STATUS_FAILURE]);
    });
});
