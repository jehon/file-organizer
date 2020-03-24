
const options = require('./file-organizer/options.js');
const { notify } = require('./file-organizer/messenger.js');
const constants = require('./file-organizer/constants.js');

options.headless = false;

require('./file-organizer/gui.js');

notify('hello world', {})
