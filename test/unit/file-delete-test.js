
const { basename } = require('path');
const FileDelete = require('../../file-organizer/main/file-delete.js');

const { createFileFrom, fileExists } = require('./helpers.js');

describe(basename(__filename), function () {
    it('should delete a file', async function () {
        const f = await createFileFrom('jh-patch-file-patch.txt');
        const ff = new FileDelete(f.path);
        await ff.analyse();
        await ff.act();

        expect(await fileExists(f.path)).toBeFalsy();
    });
});
