
const list = [];
let guiCallback = (_channel, _data) => { };

let id = 0;

module.exports.getEntityId = function () {
    return id++;
};

module.exports.notify = function (data) {
    list.push(data);
    guiCallback(data);
};

module.exports.register = function (cb) {
    guiCallback = cb;
    for (const data of list) {
        cb(data);
    }
};

module.exports.notify('started');
