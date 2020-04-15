
const { basename } = require('path');

describe(basename(__filename), () => {
    it('should be true', () => {
        expect(true).toBeTruthy();
    });

    it('should work with expectAsync', async function () {
        // https://jasmine.github.io/api/3.4/async-matchers.html
        // https://jasmine.github.io/api/3.4/jasmine.html

        await expectAsync(Promise.resolve({ a: 1, b: 2 }))
            .toBeResolved();

        await expectAsync(Promise.resolve({ a: 1, b: 2 }))
            .toBeResolvedTo(jasmine.objectContaining({ a: 1 }));

        await expectAsync(Promise.reject({ a: 1, b: 2 }))
            .toBeRejected();

        await expectAsync(Promise.reject({ a: 1, b: 2 }))
            .toBeRejectedWith(jasmine.objectContaining({ a: 1 }));
    });
});
