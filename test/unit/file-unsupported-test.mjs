
import { t } from '../test-helper.js';

import FileUnsupported, { dumpDiscoveredExtension, _map } from '../../src/main/file-types/file-unsupported.js';
import Item from '../../src/main/item.js';
import {
    STATUS_CREATED,
    STATUS_ANALYSING,
    STATUS_FAILURE
} from '../../src/common/constants.js';

import { getStatusChangesForItem } from './help-functions.mjs';
import { FOError } from '../../src/main/file-types/file.js';

describe(t(import.meta), function () {
    beforeEach(() => {
        spyOn(Item.prototype, 'notify').and.callThrough();
        console.info.calls.reset();
    });

    it('should always be rejected', async function () {
        _map.clear();

        expect(() => dumpDiscoveredExtension()).not.toThrow();
        expect(console.info).not.toHaveBeenCalled();

        {
            const f = new FileUnsupported('failure.txt');
            await expectAsync(f.runAnalyse()).toBePending();
            await expectAsync(f.runActing()).toBeRejectedWithError(FOError);
            expect(getStatusChangesForItem(f)).toEqual([
                STATUS_CREATED,
                STATUS_ANALYSING,
                STATUS_FAILURE
            ]);
        }
        {
            const f = new FileUnsupported('failure2.txt');
            await expectAsync(f.runAnalyse()).toBeRejectedWithError(FOError);
            await expectAsync(f.runActing()).toBeRejectedWithError(FOError);
        }

        console.info.calls.reset();
        expect(() => dumpDiscoveredExtension()).not.toThrow();
        expect(console.info).toHaveBeenCalled();

        expect(_map.size).toBe(1);
        expect(_map.get('.txt')).toBe(2);
    });
});
