
const Item = require('./item.js')
const {
    TYPE_INFO
} = require('../constants.js');

module.exports = class Info extends Item {
    static getType() {
        return TYPE_INFO;
    }
};
