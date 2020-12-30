
// TODO: should it be a map ?
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

    data = buildNotifyObject(data);

    list.push(data);

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

/**
 * @param {any} obj to be sent
 * @returns {any} ready to be sent
 */
function buildNotifyObject(obj) {
    if (obj == null) {
        return null;
    }

    if (typeof obj != 'object') {
        return obj;
    }

    if (obj.toJSON) {
        obj = obj.toJSON();
    }

    let res = {};
    for (let i of Object.keys(obj)) {
        if (obj[i] === null || obj[i] === undefined) {
            continue;
        }

        let v = obj[i];
        // if (typeof (v) == 'function') {
        //     v = v();
        // }

        res[i] = buildNotifyObject(v);
    }

    return res;
}