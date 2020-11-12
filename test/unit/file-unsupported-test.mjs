
import { t } from '../test-helper.js';

import FileUnsupported from '../../file-organizer/main/file-unsupported.js';
import Item from '../../file-organizer/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE
} from '../../src/common/constants.js';

import { getStatusHistoryForItem } from './help-functions.mjs';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
        console.info.calls.reset();
    });

    it('should be always good', async function () {
        FileUnsupported._map.clear();

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
