
const { basename } = require('path');
const {
    TaskFileDelete
} = require('../../file-organizer/main/tasks-fs.js');

const { createFileFrom, fileExists } = require('./helpers.js');

describe(basename(__filename), function () {
    it('should delete a file', async function () {
        const f = await createFileFrom('jh-patch-file-patch.txt');

        await (new TaskFileDelete())
            .withParent(f)
            .run();

        expect(await fileExists(f.path)).toBeFalsy();
    });
});
