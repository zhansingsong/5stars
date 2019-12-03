const bluebird = require('bluebird');
const fs = require('fs-extra');
module.exports = bluebird.promisifyAll(fs);
