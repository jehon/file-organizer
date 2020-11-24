
module.exports.CHANNEL_MAIN = 'main';

module.exports.TYPE_FILE = 'type_file';
module.exports.TYPE_TASK = 'type_task';

/*
   ~: virtual state, does not stay there
   +: aggregate from sub-elements
 */

/* FF I ~ ─┤           */ module.exports.STATUS_CREATED = 'status_created';
/* FF . .  ├──┐        */ module.exports.STATUS_ANALYSING = 'status_analysing';
/* FF . .  │  ├──x     */ module.exports.STATUS_SUCCESS = 'status_success';
/* ++ I .  |  ├──x     */ module.exports.STATUS_FAILURE = 'status_failure';
/* ++ . T  └──┤        */ module.exports.STATUS_NEED_ACTION = 'status_need_action';
/* ++ . T     └──┐     */ module.exports.STATUS_ACTING = 'status_acting';
/* ++ I T        ├──x  */ module.exports.STATUS_ACTED_SUCCESS = 'status_acted_success';
/* ++ I T        └──x  */ module.exports.STATUS_ACTED_FAILURE = 'status_acted_failure';
