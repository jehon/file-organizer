
module.exports.CHANNEL_MAIN = 'main';

module.exports.TYPE_FOLDER = 'type_folder';
module.exports.TYPE_FILE = 'type_file';
module.exports.TYPE_INFO = 'type_info';
module.exports.TYPE_PROBLEM = 'type_problem';
module.exports.TYPE_TASK = 'type_task';

module.exports.STATUS_CREATED = 'status_created';
module.exports.STATUS_ANALYSING = 'status_analysing';

// Analysing -> success / failure / need_action
module.exports.STATUS_SUCCESS = 'status_success';
module.exports.STATUS_FAILURE = 'status_failure'; // Final status: is impossible to fix
module.exports.STATUS_NEED_ACTION = 'status_need_action';

// updating -> updating_success / updating_failure
module.exports.STATUS_ACTING = 'status_acting';
module.exports.STATUS_ACTED_SUCCESS = 'status_acted_success';
module.exports.STATUS_ACTED_FAILURE = 'status_acted_failure';
