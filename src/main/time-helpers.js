
// TODO(timestamp): factorize it here

// /**
//  * @param {string} time - the time
//  * @param {string} toTZ - the timezone in which to set the time
//  */
// export function utc2local(time, toTZ) {

// }

// /**
//  * @param {string} time - the time
//  * @param {string} fromTZ - the timezone of the time
//  */
// export function local2utc(time, fromTZ) {

// }

/**
 * @param {module:src/main/Timestamp} timestamp to be checked
 * @returns {boolean} if it is yyyy-yyyy format or yyyy-mm yyyy-mm format
 */
export function isRange(timestamp) {
    return timestamp.yearMin > 0 && timestamp.yearMax > 0;
}
