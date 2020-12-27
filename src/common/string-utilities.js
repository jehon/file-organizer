

/**
 * @param {number} number to be padded to <n> digits
 * @param {number} n of digits
 * @returns {string} padded
 */
export function pad(number, n = 2) {
    return ('' + number).padStart(n, '0');
}
