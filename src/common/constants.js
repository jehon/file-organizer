
export const CHANNEL_MAIN = 'main';

export const TYPE_FILE = 'type_file';
export const TYPE_TASK = 'type_task';

/*
   ~: virtual state, does not stay there
   +: aggregate from sub-elements
 */

/* F ~ ─┤           */ export const STATUS_CREATED = 'status_created';
/* F .  ├──┐        */ export const STATUS_ANALYSING = 'status_analysing';
/* F .  │  ├──x     */ export const STATUS_SUCCESS = 'status_success';
/* + .  |  ├──x     */ export const STATUS_FAILURE = 'status_failure';
/* + T  └──┤        */ export const STATUS_NEED_ACTION = 'status_need_action';
/* + T     └──┐     */ export const STATUS_ACTING = 'status_acting';
/* + T        ├──x  */ export const STATUS_ACTED_SUCCESS = 'status_acted_success';
/* + T        └──x  */ export const STATUS_ACTED_FAILURE = 'status_acted_failure';

export const convertedSuffix = '_converted';
