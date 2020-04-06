
module.exports.CHANNEL_MAIN = 'main';

module.exports.TYPE_FOLDER = 'type_folder';
module.exports.TYPE_FILE = 'type_file';
module.exports.TYPE_INFO = 'type_info';
module.exports.TYPE_PROBLEM = 'type_problem';
module.exports.TYPE_TASK = 'type_task';

/*
   ~: virtual state, does not stay there
   +: aggregate from sub-elements
 */

/* FFIP~ ─┤           */ module.exports.STATUS_CREATED = 'status_created';
/* FF.P.  ├──┐        */ module.exports.STATUS_ANALYSING = 'status_analysing';
/* FF...  │  ├──x     */ module.exports.STATUS_SUCCESS = 'status_success';
/* ++.P.  |  ├──x     */ module.exports.STATUS_FAILURE = 'status_failure';
/* ++.PT  └──┤        */ module.exports.STATUS_NEED_ACTION = 'status_need_action';
/* ++.+T     └──┐     */ module.exports.STATUS_ACTING = 'status_acting';
/* ++I+T        ├──x  */ module.exports.STATUS_ACTED_SUCCESS = 'status_acted_success';
/* ++.+T        └──x  */ module.exports.STATUS_ACTED_FAILURE = 'status_acted_failure';
