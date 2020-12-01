
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
    const loadCJS = function (f) {
        return import('../../file-organizer/' + f)
            .then(ft => ft.default.init())
            .catch(e => {
                console.error(`Error loading ${f}`, e);
                throw e;
            });
    };

    await Promise.all(
        [
            loadCJS('file-generic.js'),
            loadCJS('file-folder.js'),
            loadCJS('file-movie.js'),
            loadCJS('file-picture.js'),
        ]);

    await importDirectory('src/main/file-types', /file-.+[.]js/);
}
