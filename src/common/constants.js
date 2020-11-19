
export const CHANNEL_MAIN = 'main';

export const TYPE_FOLDER = 'type_folder';
export const TYPE_FILE = 'type_file';
export const TYPE_INFO = 'type_info';
export const TYPE_TASK = 'type_task';

/*
   ~: virtual state, does not stay there
   +: aggregate from sub-elements
 */

/* FF I ~ ─┤           */ export const STATUS_CREATED = 'status_created';
/* FF I .  ├──┐        */ export const STATUS_ANALYSING = 'status_analysing';
/* FF I .  │  ├──x     */ export const STATUS_SUCCESS = 'status_success';
/* ++ I .  |  ├──x     */ export const STATUS_FAILURE = 'status_failure';
/* ++ I T  └──┤        */ export const STATUS_NEED_ACTION = 'status_need_action';
/* ++ . T     └──┐     */ export const STATUS_ACTING = 'status_acting';
/* ++ I T        ├──x  */ export const STATUS_ACTED_SUCCESS = 'status_acted_success';
/* ++ I T        └──x  */ export const STATUS_ACTED_FAILURE = 'status_acted_failure';

export const convertedSuffix = '_converted';