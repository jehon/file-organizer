
const { basename } = require('path');

const { ellipseLeft } = require('../../file-organizer/string-utils');

describe(basename(__filename), function () {
    it('should elipseLeft', function () {
        expect(ellipseLeft('0123456789', 5)).toBe('...89');
        expect(ellipseLeft('0123456789', 15)).toBe('0123456789     ');
    });
});
