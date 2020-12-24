
const list = [];
let guiCallback = (_data) => { };

let id = 1;

/**
 * @returns {number} of the entity (unique id)
 */
export function getEntityId() {
    return id++;
}

/**
 * @param {object} data to notify
 */
export function notify(data) {
    if (!data.id || !data.type) {
        throw `Invalid data: no id or no data: ${JSON.stringify(data)}`;
    }
    list.push(data);

    // console.info('> ', JSON.stringify(data));

    guiCallback(data);
}

/**
 * @param {function(object): void} cb to receive updates
 */
export async function registerGuiCallback(cb) {
    guiCallback = cb;
    for (const data of list) {
        await cb(data);
    }
}
