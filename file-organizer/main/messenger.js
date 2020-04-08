
const list = [];
let guiCallback = (_channel, _data) => { };

let id = 1;

module.exports.getEntityId = function () {
    return id++;
};

module.exports.notify = function (data) {
    if (!data.id || !data.type) {
        throw `Invalid data: no id or no data: ${JSON.stringify(data)}`;
    }
    list.push(data);

    console.info("> ", JSON.stringify(data));

    guiCallback(data);
};

module.exports.register = function (cb) {
    guiCallback = cb;
    for (const data of list) {
        cb(data);
    }
};
