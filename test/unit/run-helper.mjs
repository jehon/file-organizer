
import fs from 'fs';
import { tempPath } from './help-functions.mjs';

import options from '../../file-organizer/options.js';

import loadFileTypes from '../../src/main/loadFileTypes.js';

// Clean up the temp folder !
beforeAll(async () => {
    await fs.promises.rmdir(tempPath(), { recursive: true });
    await fs.promises.mkdir(tempPath(), { recursive: true });

    await loadFileTypes();
});

/**
 *
 */
export function resetOptionsForUnitTesting() {
    options._resetToDefault();
    options.withFileSummary = false;
    options.headless = true;
}
