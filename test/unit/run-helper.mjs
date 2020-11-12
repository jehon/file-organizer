
import fs from 'fs';
import { tempPath } from './help-functions.mjs';

import options from '../../file-organizer/options.js';

// Clean up the temp folder !
beforeAll(async () => {
    return fs.promises.rmdir(tempPath(), { recursive: true })
        .then(() => fs.promises.mkdir(tempPath(), { recursive: true }));
});

/**
 *
 */
export function resetOptionsForUnitTesting() {
    options.resetToDefault();
    options.withFileSummary = false;
    options.headless = true;
}
