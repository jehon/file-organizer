
import importDirectory from './importDirectory.js';

/**
 * Load the map with files in the folder
 *
 * @returns {Promise<void>}
 */
export default async function loadFileTypes() {
    //
    // We could not reset, because in esm modules, the init
    // is done on first load
    //

    const loadCJS = (f) => import(f).then(ft => ft.default.init());

    await Promise.all(
        [
            loadCJS('../../file-organizer/file-generic.js'),
            loadCJS('../../file-organizer/file-folder.js'),
            loadCJS('../../file-organizer/file-movie.js'),
            loadCJS('../../file-organizer/file-picture.js'),
        ]);

    await importDirectory('src/main/file-types', /file-.+[.]js/);
}
