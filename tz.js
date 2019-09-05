// "GPSPosition": "50 deg 35' 30.84\" N, 5 deg 33' 25.92\" E"

const moment = require('moment');
require('moment-timezone');
const tzlookup = require('tz-lookup');
const mtz = tzlookup(50.353084, 5.332592);

console.log('mtz', mtz);

// https://stackoverflow.com/a/43527200/1954789
console.log('Summer');
var now = moment('2019-07-02 15:16:17Z');
now.tz(mtz);
console.log(now.format('YYYY-MM-DD HH:mm:ss'));

console.log('Winter');
var now = moment('2019-02-02 15:16:17Z');
now.tz(mtz);
console.log(now.format('YYYY-MM-DD HH:mm:ss'));