
import importDirectory from './importDirectory.js';
import { _reset } from './register-file-types.js';

/**
 * Load the map with files in the folder
 *
 * @returns {Promise<void>}
 */
export default async function loadFileTypes() {
    _reset();

    const loadCJS = (f) => import(f).then(ft => ft.default.init());

    await Promise.all(
        [
            loadCJS('../../file-organizer/file-generic.js'),
            loadCJS('../../file-organizer/file-folder.js'),
            loadCJS('../../file-organizer/file-movie.js'),
            loadCJS('../../file-organizer/file-picture.js'),

            loadCJS('../../file-organizer/main/file-hidden.js'),

            // used to initialize the buildFile
            loadCJS('../../file-organizer/main/file-folder.js'),
            loadCJS('../../file-organizer/main/file.js'),
        ]);

    await importDirectory('src/main/file-types');
}
