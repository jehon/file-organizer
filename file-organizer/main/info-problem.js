
const Info = require('./info.js');
const {
    STATUS_FAILURE
} = require('../constants.js');

module.exports = class InfoProblem extends Info {
    constructor(title, parent) {
        super(title, parent);
        this.notify(STATUS_FAILURE);
    }
};
