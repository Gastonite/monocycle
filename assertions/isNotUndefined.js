const complement = require('ramda/src/complement')
const isUndefined = require('./isUndefined')

module.exports = complement(isUndefined)