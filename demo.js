
const options = require('./file-organizer/options.js');
const { notify } = require('./file-organizer/messenger.js');
const constants = require('./file-organizer/constants.js');

options.headless = false;

require('./file-organizer/gui.js');

notify('hello world', {})

notify('main', { type: constants.TASK_CREATED, id: 1001 });
notify(1001, { type: constants.TASK_CREATED });

notify('main', { type: constants.TASK_CREATED, id: 1002 });
notify(1002, { type: constants.TASK_CREATED });

notify('main', { type: constants.TASK_CREATED, id: 1003 });
notify(1003, { type: constants.TASK_CREATED });

notify('main', { type: constants.TASK_CREATED, id: 1004 });
notify(1004, { type: constants.TASK_CREATED });


