
let id = 0;

module.exports.getEntityId = function () {
    return id++;
}

module.exports.notify = function (channel, data) {
    console.info(channel, ": ", JSON.stringify(data));
}
