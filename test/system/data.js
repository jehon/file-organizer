
/**
 * Data builder
 *
 * @param {string} ts - the exiv timestamp
 * @param {string} title - the exiv title
 * @returns {object} for storage
 * @property {string} ts - the exiv timestamp
 * @property {string} title - the exiv title
 */
function b(ts, title) {
    return {
        ts,
        title
    };
}

export default {
    'basic/2018-01-02 03-04-05 my title [my original name].jpg': b('2018-01-02 03-04-05', 'my comment'),
    'basic/DSC_2506.MOV': b('2019-09-19 07-48-25', ''),
    'basic/IMG_20190324_121437.jpg': b('2019-03-24 12-14-38', ''),
    'basic/VID_20190324_121446.mp4': b('2019-03-24 12-14-46', ''),

    '2019 test/1.jpeg': b('', ''),
    '2019 test/DSC_2506.MOV': b('2019-09-19 07-48-25', ''),
};