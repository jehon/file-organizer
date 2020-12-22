
import importDirectory from './importDirectory.js';

/**
 * Load the map with files in the folder
 *
 * @returns {Promise<void>}
 */
export default async function loadFileTypes() {
    await importDirectory('src/main/file-types', /file-.+[.]js/);
}
