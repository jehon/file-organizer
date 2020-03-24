
const list = [];
let guiCallback = (_channel, _data) => { };

let id = 0;

module.exports.getEntityId = function () {
    return id++;
};

module.exports.notify = function (channel, data) {
    list.push({ channel, data });
    console.info(channel, ': ', JSON.stringify(data));
    guiCallback(channel, data);
};

module.exports.register = function (cb) {
    guiCallback = cb;
};

module.exports.notify('main', 'started');
