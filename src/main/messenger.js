/**
 * Counter of items
 *   To keep an unique id by item
 *
 * @see getEntityId()
 *
 * @type {number}
 */
let id = 1;

/**
 * Hold the last state of each object
 *
 * @type {Map<number,object>}
 */
const history = new Map();

/**
 * To register the gui notify function
 *
 * @param {object} _data with the item notified
 */
let guiCallback = (_data) => { };


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
    if (!data.id || !data.type || (typeof (data.id) != 'number')) {
        throw `Invalid data: no id or no type: ${JSON.stringify(data)}`;
    }

    data = buildNotifyObject(data);

    history.set(data.id, data);

    guiCallback(data);
}

/**
 * @param {function(object): void} cb to receive updates
 */
export async function registerGuiCallback(cb) {
    guiCallback = cb;
    for (const data of history.values()) {
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

    if (Array.isArray(obj)) {
        let res = [];
        for (const v of obj) {
            res.push(buildNotifyObject(v));
        }
        return res;
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