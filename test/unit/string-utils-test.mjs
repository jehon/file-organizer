
import { t } from '../test-helper.js';

import { ellipseLeft } from '../../file-organizer/string-utils.js';

describe(t(import.meta), function () {
    it('should elipseLeft', function () {
        expect(ellipseLeft('0123456789', 5)).toBe('...89');
        expect(ellipseLeft('0123456789', 15)).toBe('0123456789     ');
    });
});
